import { ApiProperty } from '@nestjs/swagger';
import { Chat } from '@src/core/chat/entities/chat.entity';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export class MessageDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Chat)
  chat: Chat;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Chat)
  employee: Chat;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Chat)
  patient: Chat;
}