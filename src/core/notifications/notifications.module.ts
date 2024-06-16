import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./service/notifications.service";
import { envData } from "@src/config/typeorm";
import { OneSignalModule } from "onesignal-api-client-nest";
@Module({
  imports: [
    OneSignalModule.forRoot({
      appId: envData.ONESIGNAL_APP_ID,
      restApiKey: envData.ONESIGNAL_API_KEY,
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
