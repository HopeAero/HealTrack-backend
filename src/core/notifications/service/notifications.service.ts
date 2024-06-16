import { Injectable } from "@nestjs/common";
import { OneSignalService, IOneSignalModuleOptions } from "onesignal-api-client-nest";
import { IViewNotificationsInput, NotificationBySegmentBuilder } from "onesignal-api-client-core";

@Injectable()
export class NotificationsService {
  constructor(private readonly onesignalService: OneSignalService) {}

  async viewNotification(notificationId: string) {
    return await this.onesignalService.viewNotification({ id: notificationId });
  }

  async viewNotifications() {
    const input: IViewNotificationsInput = {
      offset: 0,
      limit: 50,
      kind: 0,
    };

    return await this.onesignalService.viewNotifications(input);
  }

  async createNotification(message: string) {
    const input = new NotificationBySegmentBuilder()
      .setIncludedSegments(["Total Subscriptions"])
      .notification()
      .setContents({ en: message })
      .build();

    const notification = await this.onesignalService.createNotification(input);

    return notification;
  }
}
