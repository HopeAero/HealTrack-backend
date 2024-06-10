import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./entities/messagge.entity";
import { MessagesService } from "./messagges.service";

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessaggesModule {}
