import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreateNotificationDto {
  @ApiProperty({ example: "Emergency Alert", required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: "The patient with ID 123 has triggered the panic button.",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ example: 1, description: "ID of the employee to notify", required: true })
  @IsNotEmpty()
  employeeId: number;
}
