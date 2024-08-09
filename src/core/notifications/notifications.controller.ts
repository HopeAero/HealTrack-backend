import { Controller, Get, Post, Body, Param, Patch, Delete, NotFoundException, Query } from "@nestjs/common";
import { NotificationsService } from "./service/notifications.service";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { Notification } from "./entities/notification.entity";

@ApiTags("notification")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: "Crear una nueva notificación" })
  @ApiResponse({ status: 201, description: "Notificación creada exitosamente", type: Notification })
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: "Obtener todas las notificaciones" })
  @ApiResponse({ status: 200, description: "Lista de todas las notificaciones", type: [Notification] })
  async findAll(): Promise<Notification[]> {
    return this.notificationsService.findAll();
  }

  @Get("count/unread")
  @ApiOperation({ summary: "Contar el número de notificaciones no leídas para un empleado" })
  @ApiResponse({ status: 200, description: "Número de notificaciones no leídas" })
  async countUnreadNotifications(@Query("employeeId") employeeId: number): Promise<number> {
    return this.notificationsService.countUnreadNotifications(employeeId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener una notificación por ID" })
  @ApiParam({ name: "id", description: "ID de la notificación a obtener", type: Number })
  @ApiResponse({ status: 200, description: "Notificación obtenida exitosamente", type: Notification })
  @ApiResponse({ status: 404, description: "Notificación no encontrada" })
  async findOne(@Param("id") id: number): Promise<Notification> {
    const notification = await this.notificationsService.findOne(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar una notificación existente" })
  @ApiParam({ name: "id", description: "ID de la notificación a actualizar", type: Number })
  @ApiResponse({ status: 200, description: "Notificación actualizada exitosamente", type: Notification })
  @ApiResponse({ status: 404, description: "Notificación no encontrada" })
  async update(@Param("id") id: number, @Body() updateNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar una notificación" })
  @ApiParam({ name: "id", description: "ID de la notificación a eliminar", type: Number })
  @ApiResponse({ status: 200, description: "Notificación eliminada exitosamente" })
  @ApiResponse({ status: 404, description: "Notificación no encontrada" })
  async remove(@Param("id") id: number): Promise<void> {
    await this.notificationsService.remove(id);
  }

  // @Post()
  // async send(@Body() createNotificationDto: CreateNotificationDto) {
  //   return await this.notificationsService.createNotification(createNotificationDto.message);
  // }

  // @Get()
  // async findAllViejo() {
  //   return await this.notificationsService.viewNotifications();
  // }

  // @Get(":id")
  // async findOneViejo(@Param("id") id: string) {
  //   return await this.notificationsService.viewNotification(id);
  // }
}
