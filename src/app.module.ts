import { DynamicModule, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import typeorm from "./config/typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeesModule } from "./core/employees/employees.module";
import { PatientsModule } from "./core/patients/patients.module";
import { AuthModule } from "./core/auth/auth.module";
import { UsersModule } from "./core/users/users.module";
import { ChatsModule } from "./core/chats/chats.module";
import { MessaggesModule } from "./core/messagges/messagges.module";
import { SocketModule } from "./common/socket/socket.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get("typeorm"),
    }),
    UsersModule,
    PatientsModule,
    AuthModule,
    EmployeesModule,
    MessaggesModule,
    ChatsModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
