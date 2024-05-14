import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsDate,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  IsDefined,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  Matches,
  ValidateNested,
  IsNumberString,
} from "class-validator";
import { Type } from "class-transformer";
import { Hospital } from "@src/core/employees/entities/hospital.entity";
import { SurgeryType } from "@src/constants/surgery/type";
import { isUniqueDb } from "@youba/nestjs-dbvalidator";
import { CreateHospitalDto } from "@src/core/employees/dto/hospital.dto";
import { StatusPatient } from "@src/constants/status/statusPatient";
import { CreateUserDto } from "@src/core/users/dto/create-user.dto";

export class CreatePatientDto {
  @ApiProperty({ example: 22, required: true })
  @IsNotEmpty()
  @IsNumber()
  age: number;

  @ApiProperty({ example: "El culo de pzo", required: false })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ example: "1234567890", required: true })
  @IsNotEmpty()
  @IsNumberString()
  personalPhone: string;

  @ApiProperty({ example: "0987654321", required: true })
  @IsNotEmpty()
  @IsNumberString()
  homePhone: string;

  @ApiProperty({ type: CreateHospitalDto, required: true })
  @IsNotEmpty()
  @Type(() => Hospital)
  @ValidateNested()
  hospital: Hospital;

  @ApiProperty({ example: "2021-09-01", required: true })
  @IsNotEmpty()
  @IsDateString()
  surgeryDate: string;

  @ApiProperty({ example: "Cirugía de corazón", required: true })
  @IsNotEmpty()
  @IsString()
  surgeryProcedure: string;

  @ApiProperty({ enum: SurgeryType })
  @IsNotEmpty()
  @IsEnum(SurgeryType)
  surgeryType: SurgeryType;

  @ApiProperty({ example: true, required: true })
  @IsNotEmpty()
  @IsBoolean()
  automaticTracking: boolean;

  @ApiProperty({ enum: StatusPatient, example: StatusPatient.ACTIVE })
  @IsOptional()
  @IsEnum(StatusPatient, { message: "Status invalido" })
  status: StatusPatient;

  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  medicId: number;

  @ApiProperty({ type: CreateUserDto, required: true })
  @IsNotEmpty()
  @Type(() => CreateUserDto)
  @ValidateNested()
  user: CreateUserDto;
}
