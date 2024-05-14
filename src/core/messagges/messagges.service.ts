import { Injectable } from '@nestjs/common';
import { CreateMessaggeDto } from './dto/create-messagge.dto';
import { UpdateMessaggeDto } from './dto/update-messagge.dto';

@Injectable()
export class MessaggesService {
  create(createMessaggeDto: CreateMessaggeDto) {
    return 'This action adds a new messagge';
  }

  findAll() {
    return `This action returns all messagges`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messagge`;
  }

  update(id: number, updateMessaggeDto: UpdateMessaggeDto) {
    return `This action updates a #${id} messagge`;
  }

  remove(id: number) {
    return `This action removes a #${id} messagge`;
  }
}
