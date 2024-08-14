import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Chat } from "../entities/chat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { getConnection, Repository } from "typeorm";
import { MessagesService } from "@src/core/messagges/messagges.service";
import { AuthService } from "@src/core/auth/service/auth.service";
import { UsersService } from "@src/core/users/service/users.service";
import { Server, Socket } from "socket.io";
import { WsException } from "@nestjs/websockets";
import { classToPlain, plainToClass } from "class-transformer";
import { ChatDto } from "../dto/chat.dto";
import { User } from "@src/core/users/entities/user.entity";
import { MessageDto } from "@src/core/messagges/dto/message.dto";
import { Message } from "@src/core/messagges/entities/messagge.entity";
import { SocketService } from "@src/common/modules/external/services/socket.service";
import { envData } from "@src/config/typeorm";
import { MessageContent } from "@src/constants/message/type";
import { NotificationsService } from "@src/core/notifications/service/notifications.service";
import { MessageNotificationsService } from "@src/core/messageNotifications/service/messageNotifications.service";

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private charRepo: Repository<Chat>,
    private readonly messagesService: MessagesService,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private socketService: SocketService,
    @InjectRepository(Message)
    private readonly messaRepo: Repository<Message>,
    private readonly messageNotificationsService: MessageNotificationsService
  ) {}

  async getUserFromSocket(socket: Socket) {
    const authHeader = socket.handshake.headers.authorization;
    if (!authHeader) {
      throw new WsException("No se proporcionó un encabezado de autorización.");
    }

    const user = await this.authService.getUserFromAuthenticationToken(authHeader.replace("Bearer ", ""));
    if (!user) {
      throw new WsException("Credenciales inválidas.");
    }
    return user;
  }

  async create(chatDto: ChatDto, user: User): Promise<Chat> {
    const data = classToPlain(chatDto);
    const users = [];

    if (data?.users?.length) {
      for (const { id } of data?.users) {
        const user = await this.userService.findOne(id);
        users.push(user);
      }
    }

    const createdChat = this.charRepo.create({
      ...plainToClass(Chat, data),
      users,
      created_by: user,
    });
    await this.charRepo.save(createdChat);

    if (createdChat) {
      this.socketService.socket.sockets.emit("chat_created", {
        event: "chat_created",
        data: {
          user,
          newChat: createdChat,
        },
      });
    }

    return createdChat;
  }

  async update(id: number, chatDto: ChatDto) {
    const findedChat = await this.charRepo.findOne({
      where: { id },
      relations: ["users"],
    });

    if (!findedChat) {
      throw new BadRequestException("Chat not found.");
    }

    const data = classToPlain(chatDto);
    const updatedChat = await this.charRepo.save({
      id,
      ...findedChat,
      ...plainToClass(Chat, data),
      users: findedChat.users.concat(chatDto.users),
    });

    return await this.charRepo.findOne({
      where: { id: updatedChat.id },
      relations: ["users"],
    });
  }

  async deleteById(id: number) {
    const findedChat = await this.charRepo.findOne({ where: { id } });

    if (!findedChat) {
      throw new BadRequestException("Chat not found.");
    }

    return await this.charRepo.delete(id);
  }

  async getItems(user: User): Promise<Chat[]> {
    let chats = await this.charRepo
      .createQueryBuilder("chat")
      .innerJoin("chats_users_user", "cu", 'chat.id = cu."chatsId"')
      .leftJoinAndSelect("chat.users", "users")
      .leftJoinAndSelect("chat.created_by", "created_by")
      .where(`chat."createdById" = ${user.id} OR cu."userId" = ${user.id}`)
      .getMany();

    for (const chat of chats) {
      const lastMessage = await this.messaRepo
        .createQueryBuilder("message")
        .leftJoinAndSelect("message.user", "user")
        .where("message.chatId = :chatId", { chatId: chat.id })
        .orderBy("message.createdAt", "DESC")
        .getOne();

      chat.last_message = lastMessage;
    }

    chats = chats.sort((a, b) => {
      if (a.last_message && b.last_message) {
        if (a.last_message.createdAt > b.last_message.createdAt) {
          return -1;
        }
        if (a.last_message.createdAt < b.last_message.createdAt) {
          return 1;
        }
      } else if (a.last_message) {
        return -1;
      } else if (b.last_message) {
        return 1;
      }
      return 0;
    });

    return chats;
  }

  async get(id: number): Promise<Chat> {
    const chat = await this.charRepo.findOne({
      where: { id },
      relations: ["users"],
    });

    if (!chat) {
      throw new BadRequestException("Chat not found.");
    }
    return chat;
  }

  async createMessage(id: number, messageDto: MessageDto, file: Express.Multer.File, user: User): Promise<Message> {
    const chat = await this.charRepo.findOne({
      where: { id },
      relations: ["users"],
    });

    if (!chat) {
      throw new BadRequestException("Chat not found.");
    } else {
      const userRepo = await this.userService.findOne(user.id);
      if (file) {
        const newPath = envData.DATABASE_URL + "/" + file.path.replace(/\\/g, "/");
        messageDto.attachment = newPath;
      }
      const createdMessage = {
        ...messageDto,
        chat,
        user: userRepo,
      };

      const savedMessage = await this.messagesService.saveMessage(createdMessage);

      chat.last_message = savedMessage;

      await this.charRepo.save(chat);

      // Crear una notificación para el usuario receptor
      const recipient = chat.users.find(u => u.id !== user.id); // Asumiendo que hay solo un receptor por chat
      if (recipient) {
        await this.messageNotificationsService.create({
          title: `Tienes un nuevo mensaje de: ${userRepo.name} ${userRepo.lastname}. Revisa el Chat`,
          message: messageDto.message,
          userId: recipient.id,
        });
      }

      return savedMessage;
    }
  }

  async getMessages(id: number, offset: number, limit: number): Promise<Message[]> {
    const chat = await this.charRepo.findOne({
      where: { id },
      relations: ["users"],
    });

    if (!chat) {
      throw new NotFoundException("Chat not found.");
    }

    return await this.messagesService.getMessages(id, offset, limit, chat);
  }

  async savedMessage(message: MessageContent, user: User) {
    return await this.messagesService.setMessage(message, user);
  }

  async findChatBetweenUsers(userId1: number, userId2: number): Promise<Chat> {
    if (userId1 === userId2) {
      return null;
    }

    const user1Exists = await this.userService.findOne(userId1);
    const user2Exists = await this.userService.findOne(userId2);

    if (!user1Exists || !user2Exists) {
      return null;
    }

    const chat = await this.charRepo
      .createQueryBuilder("chat")
      .innerJoin("chat.users", "user1", "user1.id = :userId1", { userId1 })
      .innerJoin("chat.users", "user2", "user2.id = :userId2", { userId2 })
      .getOne();

    return chat;
  }
}
