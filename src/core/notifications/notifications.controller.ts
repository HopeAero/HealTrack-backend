import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { NotificationsService } from "./service/notifications.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("notification")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async send(@Body() createNotificationDto: CreateNotificationDto) {
    return await this.notificationsService.createNotification(createNotificationDto.message);
  }

  @Get()
  async findAll() {
    return await this.notificationsService.viewNotifications();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.notificationsService.viewNotification(id);
  }
}
