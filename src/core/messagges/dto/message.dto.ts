import { ApiProperty } from "@nestjs/swagger";
import { Chat } from "@src/core/chats/entities/chat.entity";
import { User } from "@src/core/users/entities/user.entity";
import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";

export class MessageDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ type: () => Chat })
  @ValidateNested()
  @Type(() => Chat)
  chat: Chat;

  @ApiProperty({ type: () => User })
  @ValidateNested()
  @Type(() => User)
  user: User;
}
