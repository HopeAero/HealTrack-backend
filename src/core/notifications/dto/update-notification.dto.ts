import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MaxLength, IsOptional } from "class-validator";

export class CreateNotificationDto {
  @ApiProperty({ example: "Emergency Alert", required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: "The patient with ID 123 has triggered the panic button.",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ example: 1, description: "ID of the employee to notify", required: true })
  @IsNotEmpty()
  @IsOptional()
  employeeId?: number;

  @ApiProperty({ example: 1, description: "ID of the patient to notify", required: true })
  @IsNotEmpty()
  @IsOptional()
  patientId?: number;
}
