import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./service/auth.service";
import { JwtModule } from "@nestjs/jwt";
import { PatientsModule } from "../patients/patients.module";
import { EmployeesModule } from "../employees/employees.module";
import { UsersModule } from "../users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chat } from "../chats/entities/chat.entity";
import { User } from "../users/entities/user.entity";
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, User]),
    PatientsModule,
    EmployeesModule,
    UsersModule,
    MailerModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "31d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
