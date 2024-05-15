import { Module } from "@nestjs/common";
import { ChatsService } from "./service/chats.service";
import { ChatsController } from "./chats.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chat } from "./entities/chat.entity";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { MessaggesModule } from "../messagges/messagges.module";
import { ExternalModule } from "@src/common/modules/external/external.module";
import { AuthService } from "../auth/service/auth.service";
import { PatientsModule } from "../patients/patients.module";
import { EmployeesModule } from "../employees/employees.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat]),
    UsersModule,
    MessaggesModule,
    ExternalModule,
    PatientsModule,
    EmployeesModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, AuthService],
  exports: [ChatsService],
})
export class ChatsModule {}
