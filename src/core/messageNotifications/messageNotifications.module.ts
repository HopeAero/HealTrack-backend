import { Module } from "@nestjs/common";
import { MessageNotificationsController } from "./messageNotifications.controller";
import { MessageNotificationsService } from "./service/messageNotifications.service";
import { MessageNotification } from "./entities/messageNotifications.entity";
import { User } from "../users/entities/user.entity";
import { envData } from "@src/config/typeorm";
import { OneSignalModule } from "onesignal-api-client-nest";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExternalModule } from "@src/common/modules/external/external.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageNotification, User]),
    OneSignalModule.forRoot({
      appId: envData.ONESIGNAL_APP_ID,
      restApiKey: envData.ONESIGNAL_API_KEY,
    }),
    ExternalModule,
    AuthModule,
  ],
  controllers: [MessageNotificationsController],
  providers: [MessageNotificationsService],
  exports: [MessageNotificationsService],
})
export class MessageNotificationsModule {}
