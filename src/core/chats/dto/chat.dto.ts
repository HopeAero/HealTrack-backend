import { User } from '@src/core/users/entities/user.entity';
import { IsOptional, IsString } from 'class-validator';

export class ChatDto {
  @IsString()
  title: string;

  @IsOptional()
  users: User[];
}
