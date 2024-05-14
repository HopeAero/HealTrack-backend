import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { ChatService } from "./service/chat.service";
import { Chat } from './entities/chat.entity';
import * as express from 'express';
import { ChatDto } from './dto/chat.dto';
import { MessageDto } from '../message/dto/message.dto';
import { Message } from '../message/entities/message.entity';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('')
    @HttpCode(201)
    create(@Req() req: any, @Body() chatDto: ChatDto): Promise<Chat> {
      return this.chatService.create(chatDto, req.user);
    }
  
    @Get(':id')
    @HttpCode(200)
    get(@Param('id') id: number): Promise<Chat> {
      return this.chatService.getChatById(id);
    }
  
    @Patch(':id')
    update(@Param('id') id: number, @Body() chat: ChatDto) {
      return this.chatService.update(id, chat);
    }
  
    @Get(':id/messages')
    @HttpCode(200)
    getMessages(
      @Query() { offset, limit },
      @Param('id') id: number,
    ): Promise<Message[]> {
      return this.chatService.getMessages(id, offset, limit);
    }
}