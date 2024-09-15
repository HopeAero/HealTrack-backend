import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { classToPlain, plainToClass } from "class-transformer";
import { Repository } from "typeorm";
import { MessageDto } from "./dto/message.dto";
import { User } from "../users/entities/user.entity";
import { Message } from "./entities/messagge.entity";
import { Chat } from "../chats/entities/chat.entity";
import { MessageContent } from "@src/constants/message/type";
import { envData } from "@src/config/typeorm";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  saveImage(buffer: Buffer | string, filename: string) {
    const uploadsDir = join(__dirname, "..", "..", "..", "upload");
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = join(uploadsDir, filename);
    writeFileSync(filePath, buffer);

    // Aquí puedes guardar la URL en tu base de datos
    const imageUrl = envData.DATABASE_URL + `/upload/${filename}`;
    return imageUrl;
  }

  async setMessage(message: MessageContent, user: User) {
    if (message.message.attachment && message.message.filename) {
      const newImageName = `${randomUUID()}-${message.message.filename}`;
      const attachmentUrl = this.saveImage(message.message.attachment, newImageName);
      message.message.attachment = attachmentUrl;
    }
    const newMessage = await this.messageRepo.create({
      attachment: message.message.attachment as unknown as string,
      message: message.message.message,
      user,
    });
    await this.messageRepo.save(newMessage);
    delete newMessage.user;
    return newMessage;
  }

  async saveMessage(messageDto: MessageDto): Promise<Message> {
    const data = classToPlain(messageDto);
    const createdMessage = this.messageRepo.create({
      ...plainToClass(Message, data),
    });

    await this.messageRepo.save(createdMessage);
    delete createdMessage.chat;
    return createdMessage;
  }

  async getMessages(id: number, offset?: number, limit?: number, chat?: Chat): Promise<any> {
    const [items, count] = await this.messageRepo.findAndCount({
      where: { chat: { id } },
      order: {
        createdAt: "ASC",
      },
      skip: offset,
      take: limit,
    });

    return {
      data: {
        chat,
        items,
      },
      count,
    };
  }
}
