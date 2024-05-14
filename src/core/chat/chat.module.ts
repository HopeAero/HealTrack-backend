import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './service/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { MessageModule } from '../message/message.module';
import { AuthModule } from '../auth/auth.module';
import { PatientsModule } from '../patients/patients.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  exports: [
    TypeOrmModule.forFeature([Chat]),
    MessageModule,
    AuthModule,
    PatientsModule,
    EmployeesModule,
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}