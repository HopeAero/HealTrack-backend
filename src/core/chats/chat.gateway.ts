import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { CORS } from "@src/constants";
import { AddMessageDto } from "./dto/addMessage.dto";

@WebSocketGateway({ cors: CORS })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger("ChatGateway");

  @SubscribeMessage("joinRoom")
  handleJoinRoom(socket: Socket, @MessageBody() room: string) {
    socket.join(room);
    this.logger.log(`Socket ${socket.id} joined room ${room}`);
  }

  @SubscribeMessage("chat")
  handleMessage(@MessageBody() payload: AddMessageDto): AddMessageDto {
    this.logger.log(`Message received: ${payload.author} - ${payload.body}`);
    this.server.emit("chat", payload);
    return payload;
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }
}
