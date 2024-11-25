import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./service/notifications.service";
import { Notification } from "./entities/notification.entity";
import { Employee } from "../employees/entities/employee.entity";
import { envData } from "@src/config/typeorm";
import { OneSignalModule } from "onesignal-api-client-nest";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "../patients/entities/patient.entity";
import { User } from "../users/entities/user.entity";
import { ExternalModule } from "@src/common/modules/external/external.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Employee, Patient, User]),
    OneSignalModule.forRoot({
      appId: envData.ONESIGNAL_APP_ID,
      restApiKey: envData.ONESIGNAL_API_KEY,
    }),
    ExternalModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
