import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OneSignalService, IOneSignalModuleOptions } from "onesignal-api-client-nest";
import { IViewNotificationsInput, NotificationBySegmentBuilder } from "onesignal-api-client-core";
import { InjectRepository } from "@nestjs/typeorm";
import { MessageNotification } from "../entities/messageNotifications.entity";
import { Equal, Repository } from "typeorm";
import { CreateMessageNotificationDto } from "../dto/create-messageNotifications.dto";
import { User } from "@src/core/users/entities/user.entity";
//Sockets
import { SocketService } from "@src/common/modules/external/services/socket.service";

@Injectable()
export class MessageNotificationsService {
  constructor(
    @InjectRepository(MessageNotification)
    private readonly notificationRepository: Repository<MessageNotification>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly onesignalService: OneSignalService,

    private socketService: SocketService,
  ) {}

  // Crear notificación
  async create(createMessageNotificationDto: CreateMessageNotificationDto): Promise<MessageNotification> {
    const { title, message, userId } = createMessageNotificationDto;

    // Validar que userId no sea nulo
    if (!userId) {
      throw new BadRequestException("User ID is required to create a notification");
    }

    // Buscar el usuario en el repositorio
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Crear la notificación con los datos recibidos
    const notification = this.notificationRepository.create({
      title,
      message,
      user,
    });

    // Guardar la notificación en el repositorio
    await this.notificationRepository.save(notification);

    // Calcular las notificaciones sin leer para todos los usuarios
    const unreadCounts = await this.calculateUnreadCountsForAllUsers();

    // Emitir la cuenta de notificaciones sin leer globalmente
    this.socketService.socket.sockets.emit("unread_notifications_count", {
      event: "unread_notifications_count",
      data: unreadCounts,
    });

    return notification;
  }

  // Calcular notificaciones sin leer para todos los usuarios
  private async calculateUnreadCountsForAllUsers() {
    const users = await this.userRepository.find();
    const unreadCounts = {};

    for (const user of users) {
      unreadCounts[user.id] = await this.countUnreadNotifications(user.id);
    }

    return unreadCounts;
  }

  // Obtener todas las notificaciones
  async findAll(): Promise<MessageNotification[]> {
    return this.notificationRepository.find({
      relations: ["user"],
    });
  }

  // Obtener todas las notificaciones de un usuario
  async findNotificationsByUserId(userId: number): Promise<MessageNotification[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["messageNotifications"],
      order: {
        messageNotifications: {
          createdAt: "DESC",
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.messageNotifications;
  }

  // Obtener notificación por ID
  async findOne(id: number): Promise<MessageNotification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: Equal(id) },
      relations: ["user"],
    });
    if (!notification) {
      throw new NotFoundException(`MessageNotification with ID ${id} not found`);
    }
    return notification;
  }

  // Actualizar notificación
  async update(id: number, updateMessageNotificationDto: CreateMessageNotificationDto): Promise<MessageNotification> {
    const notification = await this.findOne(id);

    const updatedNotification = Object.assign(notification, updateMessageNotificationDto);
    return this.notificationRepository.save(updatedNotification);
  }

  // Eliminar notificación
  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  // Eliminar todas las notificaciones de un usuario
  async removeAllByUserId(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["messageNotifications"],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.notificationRepository.remove(user.messageNotifications);
  }

  // Obtener número de notificaciones sin leer para un usuario
  async countUnreadNotifications(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { user: { id: userId }, isRead: false },
    });
  }

  // Cambiar el isRead a True
  async markAsRead(id: number): Promise<MessageNotification> {
    const notification = await this.findOne(id);
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  //Ver notificacion Funcion vieja
  async viewNotification(notificationId: string) {
    return await this.onesignalService.viewNotification({ id: notificationId });
  }

  async viewNotifications() {
    const input: IViewNotificationsInput = {
      offset: 0,
      limit: 50,
      kind: 0,
    };

    return await this.onesignalService.viewNotifications(input);
  }

  async createNotification(message: string) {
    const input = new NotificationBySegmentBuilder()
      .setIncludedSegments(["Total Subscriptions"])
      .notification()
      .setContents({ en: message })
      .build();

    const notification = await this.onesignalService.createNotification(input);

    return notification;
  }
}
