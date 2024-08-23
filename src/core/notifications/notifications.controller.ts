import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  NotFoundException,
  Query,
  HttpStatus,
  HttpCode,
  Res,
} from "@nestjs/common";
import { NotificationsService } from "./service/notifications.service";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { Notification } from "./entities/notification.entity";
import { Response } from "express";

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

  @Get("complete")
  @ApiOperation({ summary: "Obtener todas las notificaciones" })
  @ApiResponse({ status: 200, description: "Lista de todas las notificaciones", type: [Notification] })
  async findAllComplete(): Promise<Notification[]> {
    return this.notificationsService.findAllComplete();
  }

  @Get("count/unread")
  @ApiOperation({ summary: "Contar el número de notificaciones no leídas para un empleado" })
  @ApiResponse({ status: 200, description: "Número de notificaciones no leídas" })
  async countUnreadNotifications(@Query("employeeId") employeeId: number): Promise<number> {
    return this.notificationsService.countUnreadNotifications(employeeId);
  }

  @Delete("remove-all-deleted")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllDeleted(): Promise<void> {
    await this.notificationsService.removeAllDeleted();
  }

  @Get("panic-button-counts")
  async getPanicButtonCounts() {
    return this.notificationsService.getPanicButtonCounts();
  }

  @Get("export-panic-button-counts")
  async exportPanicButtonCountsToExcel(@Res() res: Response) {
    try {
      const buffer = await this.notificationsService.exportPanicButtonCountsToExcel();

      // Configura los encabezados de la respuesta para descargar el archivo Excel
      res.setHeader("Content-Disposition", 'attachment; filename="panic_button_counts.xlsx"');
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(buffer);
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }

  @Get("employee/:employeeId")
  @ApiOperation({ summary: "Obtener todas las notificaciones de un empleado por ID" })
  @ApiParam({ name: "employeeId", description: "ID del empleado para obtener sus notificaciones", type: Number })
  @ApiResponse({ status: 200, description: "Lista de notificaciones del empleado", type: [Notification] })
  async findNotificationsByEmployeeId(@Param("employeeId") employeeId: number): Promise<Notification[]> {
    return this.notificationsService.findNotificationsByEmployeeId(employeeId);
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

  @Delete("employee/:employeeId")
  @ApiOperation({ summary: "Eliminar todas las notificaciones de un empleado por ID" })
  @ApiParam({ name: "employeeId", description: "ID del empleado para eliminar sus notificaciones", type: Number })
  @ApiResponse({ status: 200, description: "Todas las notificaciones del empleado eliminadas exitosamente" })
  @ApiResponse({ status: 404, description: "Empleado no encontrado" })
  async removeAllByEmployeeId(@Param("employeeId") employeeId: number): Promise<void> {
    await this.notificationsService.removeAllByEmployeeId(employeeId);
  }

  @Patch("mark-as-read/:id")
  @ApiOperation({ summary: "Marcar una notificación como leída" })
  @ApiParam({ name: "id", description: "ID de la notificación a marcar como leída", type: Number })
  @ApiResponse({ status: 200, description: "Notificación marcada como leída exitosamente", type: Notification })
  @ApiResponse({ status: 404, description: "Notificación no encontrada" })
  async markAsRead(@Param("id") id: number): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }
}
