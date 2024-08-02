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
import { ReportsModule } from "./core/reports/reports.module";
import { ServeStaticModule } from "@nestjs/serve-static/dist/serve-static.module";
import { join } from "path";
import { NotificationsModule } from "./core/notifications/notifications.module";
import { ScheduleModule } from "@nestjs/schedule";
import { MailerService } from "@nestjs-modules/mailer";
import { MailerConfigModule } from "./core/mailerModule/mailer.module";
import { HospitalsModule } from "./core/employees/hospital.module";
import { FAQsModule } from "./core/faqs/faqs.module";
import { RecommendationsModule } from "./core/recommendations/recommendations.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get("typeorm"),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "upload"),
    }),
    MailerConfigModule,
    UsersModule,
    PatientsModule,
    AuthModule,
    EmployeesModule,
    HospitalsModule,
    MessaggesModule,
    ChatsModule,
    SocketModule,
    ReportsModule,
    NotificationsModule,
    FAQsModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
