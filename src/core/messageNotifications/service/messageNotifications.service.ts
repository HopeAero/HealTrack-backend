import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OneSignalService, IOneSignalModuleOptions } from "onesignal-api-client-nest";
import { IViewNotificationsInput, NotificationBySegmentBuilder } from "onesignal-api-client-core";
import { InjectRepository } from "@nestjs/typeorm";
import { MessageNotification } from "../entities/messageNotifications.entity";
import { Equal, Repository } from "typeorm";
import { CreateMessageNotificationDto } from "../dto/create-messageNotifications.dto";
import { User } from "@src/core/users/entities/user.entity";

@Injectable()
export class MessageNotificationsService {
  constructor(
    @InjectRepository(MessageNotification)
    private readonly notificationRepository: Repository<MessageNotification>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly onesignalService: OneSignalService,
  ) {}

  // Crear notificación
  async create(createMessageNotificationDto: CreateMessageNotificationDto): Promise<MessageNotification> {
    const { title, message, userId } = createMessageNotificationDto;

    // Verificar que el userId no sea nulo
    if (!userId) {
      throw new BadRequestException("User ID is required to create a notification");
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const notification = this.notificationRepository.create({
      title,
      message,
      user,
    });

    return this.notificationRepository.save(notification);
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
          createdAt: "DESC"
        }
      }
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
      where: { id: userId  },
      relations: ['messageNotifications'],
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
