import { User } from "@src/core/users/entities/user.entity";
import { IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ChatDto {
  @ApiProperty({ description: "El título del chat." })
  @IsString()
  title: string;

  @ApiPropertyOptional({ type: [User], description: "Los usuarios en el chat." })
  @IsOptional()
  users: User[];
}
