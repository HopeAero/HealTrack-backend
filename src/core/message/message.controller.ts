import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessagesService } from './service/message.service';
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessagesService) {}

}
