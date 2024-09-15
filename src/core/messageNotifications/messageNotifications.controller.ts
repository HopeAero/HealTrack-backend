import { Controller, Get, Post, Body, Param, Patch, Delete, NotFoundException, Query } from "@nestjs/common";
import { MessageNotificationsService } from "./service/messageNotifications.service";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { CreateMessageNotificationDto } from "./dto/create-messageNotifications.dto";
import { MessageNotification } from "./entities/messageNotifications.entity";

@ApiTags("message-notification")
@Controller("message-notifications")
export class MessageNotificationsController {
  constructor(private readonly messageNotificationsService: MessageNotificationsService) {}

  @Post()
  @ApiOperation({ summary: "Crear una nueva notificación de mensaje" })
  @ApiResponse({ status: 201, description: "Notificación de mensaje creada exitosamente", type: MessageNotification })
  async create(@Body() createMessageNotificationDto: CreateMessageNotificationDto): Promise<MessageNotification> {
    return this.messageNotificationsService.create(createMessageNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: "Obtener todas las notificaciones de mensaje" })
  @ApiResponse({ status: 200, description: "Lista de todas las notificaciones de mensaje", type: [MessageNotification] })
  async findAll(): Promise<MessageNotification[]> {
    return this.messageNotificationsService.findAll();
  }

  @Get("count/unread")
  @ApiOperation({ summary: "Contar el número de notificaciones de mensaje no leídas para un usuario" })
  @ApiResponse({ status: 200, description: "Número de notificaciones de mensaje no leídas" })
  async countUnreadNotifications(@Query("userId") userId: number): Promise<number> {
    return this.messageNotificationsService.countUnreadNotifications(userId);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Obtener todas las notificaciones de mensaje de un usuario por ID" })
  @ApiParam({ name: "userId", description: "ID del usuario para obtener sus notificaciones de mensaje", type: Number })
  @ApiResponse({ status: 200, description: "Lista de notificaciones de mensaje del usuario", type: [MessageNotification] })
  async findNotificationsByUserId(@Param("userId") userId: number): Promise<MessageNotification[]> {
    return this.messageNotificationsService.findNotificationsByUserId(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener una notificación de mensaje por ID" })
  @ApiParam({ name: "id", description: "ID de la notificación de mensaje a obtener", type: Number })
  @ApiResponse({ status: 200, description: "Notificación de mensaje obtenida exitosamente", type: MessageNotification })
  @ApiResponse({ status: 404, description: "Notificación de mensaje no encontrada" })
  async findOne(@Param("id") id: number): Promise<MessageNotification> {
    const notification = await this.messageNotificationsService.findOne(id);
    if (!notification) {
      throw new NotFoundException(`MessageNotification with ID ${id} not found`);
    }
    return notification;
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar una notificación de mensaje existente" })
  @ApiParam({ name: "id", description: "ID de la notificación de mensaje a actualizar", type: Number })
  @ApiResponse({ status: 200, description: "Notificación de mensaje actualizada exitosamente", type: MessageNotification })
  @ApiResponse({ status: 404, description: "Notificación de mensaje no encontrada" })
  async update(@Param("id") id: number, @Body() updateNotificationDto: CreateMessageNotificationDto): Promise<MessageNotification> {
    return this.messageNotificationsService.update(id, updateNotificationDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar una notificación de mensaje" })
  @ApiParam({ name: "id", description: "ID de la notificación de mensaje a eliminar", type: Number })
  @ApiResponse({ status: 200, description: "Notificación de mensaje eliminada exitosamente" })
  @ApiResponse({ status: 404, description: "Notificación de mensaje no encontrada" })
  async remove(@Param("id") id: number): Promise<void> {
    await this.messageNotificationsService.remove(id);
  }

  @Delete("user/:userId")
  @ApiOperation({ summary: "Eliminar todas las notificaciones de mensaje de un usuario por ID" })
  @ApiParam({ name: "userId", description: "ID del usuario para eliminar sus notificaciones de mensaje", type: Number })
  @ApiResponse({ status: 200, description: "Todas las notificaciones de mensaje del usuario eliminadas exitosamente" })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  async removeAllByUserId(@Param("userId") userId: number): Promise<void> {
    await this.messageNotificationsService.removeAllByUserId(userId);
  }

  @Patch("mark-as-read/:id")
  @ApiOperation({ summary: "Marcar una notificación de mensaje como leída" })
  @ApiParam({ name: "id", description: "ID de la notificación de mensaje a marcar como leída", type: Number })
  @ApiResponse({ status: 200, description: "Notificación de mensaje marcada como leída exitosamente", type: MessageNotification })
  @ApiResponse({ status: 404, description: "Notificación de mensaje no encontrada" })
  async markAsRead(@Param("id") id: number): Promise<MessageNotification> {
    return this.messageNotificationsService.markAsRead(id);
  }
}
