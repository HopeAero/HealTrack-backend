import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get("MAIL_HOST"),
          port: configService.get("MAIL_PORT"),
          secure: true,
          auth: {
            user: configService.get("MAIL_USER"),
            pass: configService.get("MAIL_PASS"),
          },
        },
        defaults: {
          from: `"HealTrack" <${configService.get("MAIL_FROM")}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MailerConfigModule {}
