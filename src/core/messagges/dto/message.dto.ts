import { Chat } from '@src/core/chats/entities/chat.entity';
import { User } from '@src/core/users/entities/user.entity';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';


export class MessageDto {
  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => Chat)
  chat: Chat;

  @ValidateNested()
  @Type(() => Chat)
  user: User;
}
