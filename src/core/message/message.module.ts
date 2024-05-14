import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessagesService } from './service/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
  ],
  controllers: [MessageController],
  providers: [MessagesService],
})
export class MessageModule {}
