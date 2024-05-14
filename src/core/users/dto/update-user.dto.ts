import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsJSON, IsOptional, IsString } from "class-validator";
import { AllRole, EmployeeRole } from "src/constants";

export class UpdateUserDto {
  @ApiProperty({ example: "Emmanuel" })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ example: "Salcedo" })
  @IsString()
  @IsOptional()
  lastname: string;

  @ApiProperty({ example: "admin@gmail.com" })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ example: "V30109748" })
  @IsString()
  @IsOptional()
  identification: string;

  @IsOptional()
  isVerify: boolean;

  @ApiProperty({ enum: AllRole, example: AllRole.PATIENT })
  @IsEnum(AllRole, { message: "Rol invalido" })
  @IsOptional()
  role: AllRole;
}
