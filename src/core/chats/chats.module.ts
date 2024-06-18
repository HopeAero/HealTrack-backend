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
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { Message } from "../messagges/entities/messagge.entity";

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: "./upload",
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
    TypeOrmModule.forFeature([Chat, Message]),
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
