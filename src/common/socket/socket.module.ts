import { Module } from "@nestjs/common";
import { ExternalModule } from "../modules/external/external.module";
import { ChatGateway } from "./socket.gateway";
import { ChatsModule } from "@src/core/chats/chats.module";

@Module({
  imports: [ChatsModule, ExternalModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class SocketModule {}
