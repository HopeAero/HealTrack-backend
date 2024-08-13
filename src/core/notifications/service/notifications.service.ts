import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OneSignalService, IOneSignalModuleOptions } from "onesignal-api-client-nest";
import { IViewNotificationsInput, NotificationBySegmentBuilder } from "onesignal-api-client-core";
import { InjectRepository } from "@nestjs/typeorm";
import { Employee } from "@src/core/employees/entities/employee.entity";
import { Notification } from "../entities/notification.entity";
import { Equal, Repository } from "typeorm";
import { CreateNotificationDto } from "../dto/create-notification.dto";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    private readonly onesignalService: OneSignalService,
  ) {}

  // Crear notificación
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const { title, message, employeeId } = createNotificationDto;

    // Verificar que el employeeId no sea nulo
    if (!employeeId) {
      throw new BadRequestException("Employee ID is required to create a notification");
    }

    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const notification = this.notificationRepository.create({
      title,
      message,
      employee,
    });

    return this.notificationRepository.save(notification);
  }

  // Obtener todas las notificaciones
  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find({
      relations: ["employee"],
    });
  }

  // Obtener todas las notificaciones de un empleado
  async findNotificationsByEmployeeId(employeeId: number): Promise<Notification[]> {
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: employeeId } },
      relations: ["notifications"],
    });

    if (!employee) {  
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return employee.notifications;
  }

  // Obtener notificación por ID
  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: Equal(id) },
      relations: ["employee"],
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  // Actualizar notificación
  async update(id: number, updateNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);

    const updatedNotification = Object.assign(notification, updateNotificationDto);
    return this.notificationRepository.save(updatedNotification);
  }

  // Eliminar notificación
  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  // Eliminar todas las notificaciones de un empleado
  async removeAllByEmployeeId(employeeId: number): Promise<void> {
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: employeeId } },
      relations: ['notifications'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    await this.notificationRepository.remove(employee.notifications);
  }

  // Obtener número de notificaciones sin leer para un empleado
  async countUnreadNotifications(employeeId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { employee: { id: employeeId }, isRead: false },
    });
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
