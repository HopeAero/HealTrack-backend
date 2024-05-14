import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain, plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { MessageDto } from '../dto/message.dto';
import { Message } from '../entities/message.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async setMessage(message: string, patient: Patient, employee: Employee) {
    const newMessage = await this.messageRepo.create({
      message,
      patient,
      employee,
    });
    await this.messageRepo.save(newMessage);
    delete newMessage.patient;
    delete newMessage.employee;
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

  async getMessages(id: number, offset?: number, limit?: number): Promise<any> {
    const [items, count] = await this.messageRepo.findAndCount({
      where: { chat: { id } },
      order: {
        createdAt: 'DESC',
      },
      skip: offset,
      take: limit,
    });

    return {
      data: items,
      count,
    };
  }
}