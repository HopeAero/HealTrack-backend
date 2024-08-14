import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MaxLength, IsOptional } from "class-validator";

export class UpdateMessageNotificationDto {
  @ApiProperty({ example: "New Message!", required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: "The user with ID 123 has sended you a message.",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ example: 1, description: "ID of the user to notify", required: true })
  @IsNotEmpty()
  @IsOptional()
  userId?: number;
}
