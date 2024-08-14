import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreateMessageNotificationDto {
  @ApiProperty({ example: "New Message!", required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: "The user with ID 123 has sended you a message.",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ example: 1, description: "ID of the user to notify", required: true })
  @IsNotEmpty()
  userId: number;
}
