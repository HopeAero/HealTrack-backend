import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Chat } from "../entities/chat.entity";
import { Repository } from "typeorm";
import { MessagesService } from "@src/core/message/service/message.service";
import { PatientsService } from "@src/core/patients/service/patients.service";
import { EmployeesService } from "@src/core/employees/service/employees.service";
import { AuthService } from "@src/core/auth/service/auth.service";
import { Server, Socket } from "socket.io";
import { WsException } from '@nestjs/websockets';
import { ChatDto } from "../dto/chat.dto";
import { Patient } from "@src/core/patients/entities/patient.entity";
import { Employee } from "@src/core/employees/entities/employee.entity";
import { classToPlain, plainToClass } from "class-transformer";
import { MessageDto } from "@src/core/message/dto/message.dto";
import { Message } from "@src/core/message/entities/message.entity";


@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) 
    private readonly chatRepository : Repository<Chat>,
    private readonly messageService: MessagesService,
    private readonly authService: AuthService,
    private readonly employeeService: EmployeesService,
    private readonly patientService: PatientsService,
    public socket: Server = null
  ) {
  }

  async getUserFromSocket(socket: Socket) {
    const user = await this.authService.getUserFromAuthenticationToken(
      socket.handshake.headers.authorization.replace('Bearer ', ''),
    );
    if (!user) {
      throw new WsException('Invalid credentials.');
    }
    return user;
  }

  async create(chatDto: ChatDto, employee: Employee): Promise<Chat> {
    const data = classToPlain(chatDto);

    const chat = this.chatRepository.create({
      ...plainToClass(Chat, data),
      employees: [employee],
    });

    await this.chatRepository.save(chat);

    if (chat) {
      this.socket.sockets.emit('chat_created', {
        event: 'chat_created',
        data: {
          employee,
          newChat: chat,
        },
      });


    return chat;
    
    }
  }

  async getChatsByPatient(patient: Patient): Promise<Chat[]> {
    return this.chatRepository.find({
      where: { patients: [patient] },
      relations: ['patients', 'employees', 'messages'],
    });
  }

  async getChatsByEmployee(employee: Employee): Promise<Chat[]> {
    return this.chatRepository.find({
      where: { employees: [employee] },
      relations: ['patients', 'employees', 'messages'],
    });
  }

  async getChatById(id: number): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id },
      relations: ['patients', 'employees', 'messages'],
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async createMessage(
    id: number,
    messageDto: MessageDto,
    employee: Employee,
    patient: Patient,
  ): Promise<Message> {
    const chat = await this.chatRepository.findOne(
      {
        where: { id },
      },
    );

    if (!chat) {
      throw new BadRequestException('Chat not found');
    } else {
      const userRepo = employee ? await this.employeeService.findOne(employee.id) : await this.patientService.findOne(patient.id);
      const createdMessage = {
        ...messageDto,
        chat,
        user: userRepo,
      };

      return await this.messageService.saveMessage(createdMessage);
    }
  }

  async getMessages(
    id: number,
    offset: number,
    limit: number,
  ): Promise<Message[]> {
    const chat = await this.chatRepository.findOne(
      {
        where: { id },
      },
    );

    if (!chat) {
      throw new BadRequestException('Chat not found');
    }

    return await this.messageService.getMessages(id, offset, limit);
  }

  async savedMessage(message: string, employee: Employee, patient: Patient) {
    return await this.messageService.setMessage(message, patient, employee);
  }

  async update(id: number, chatDto: ChatDto) {
    const findedChat = await this.chatRepository.findOne({
      where: { id },
      relations: ['patients', 'employees'],
    });

    if (!findedChat) {
      throw new BadRequestException('Chat not found');
    }

    const data = classToPlain(chatDto);
    const updatedChat = await this.chatRepository.save({
      id,
      ...findedChat,
      ...plainToClass(Chat, data),
      employees: findedChat.employees.concat(chatDto.employee),
      patients: findedChat.patients.concat(chatDto.patient),

    });

    return await this.chatRepository.findOne({
      where: { id },
      relations: ['patients', 'employees'],
    });;
  }

}
