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
} from "@nestjs/common";
import { ChatDto } from "./dto/chat.dto";
import { ChatsService } from "./service/chats.service";
import { Chat } from "./entities/chat.entity";
import { MessageDto } from "../messagges/dto/message.dto";
import { Message } from "../messagges/entities/messagge.entity";
import { AuthGuard } from "../auth/guard/auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("chats")
@Controller("chats")
@ApiBearerAuth()
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @UseGuards(AuthGuard)
  @Post("")
  @HttpCode(201)
  create(@Req() req: any, @Body() chatDto: ChatDto): Promise<Chat> {
    return this.chatsService.create(chatDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Get(":id")
  @HttpCode(200)
  get(@Param("id") id: number): Promise<Chat> {
    return this.chatsService.get(id);
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param("id") id: number, @Body() chat: ChatDto) {
    return this.chatsService.update(id, chat);
  }
  @UseGuards(AuthGuard)
  @Delete(":id")
  @HttpCode(200)
  async delete(@Param("id") id: number) {
    return this.chatsService.deleteById(id);
  }
  @UseGuards(AuthGuard)
  @Get("")
  @HttpCode(200)
  getItems(@Req() req: any): Promise<Chat[]> {
    return this.chatsService.getItems(req.user);
  }
  @UseGuards(AuthGuard)
  @Post(":id/messages")
  @HttpCode(201)
  sendMessage(@Req() req: any, @Param("id") id: number, @Body() messageDto: MessageDto): Promise<Message> {
    return this.chatsService.createMessage(id, messageDto, req.user);
  }
  @Get(":id/messages")
  @HttpCode(200)
  getMessages(@Query() { offset, limit }, @Param("id") id: number): Promise<Message[]> {
    return this.chatsService.getMessages(id, offset, limit);
  }
}
