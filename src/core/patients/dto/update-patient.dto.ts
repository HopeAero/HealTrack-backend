import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsNumberString,
  IsEmail,
  ValidateNested,
  IsBoolean,
  Validate,
} from "class-validator";
import { Type } from "class-transformer";
import { Hospital } from "@src/core/employees/entities/hospital.entity";
import { SurgeryType } from "@src/constants/surgery/type";
import { StatusPatient } from "@src/constants/status/statusPatient";
import { UpdateUserDto } from "@src/core/users/dto/update-user.dto";
import { isUniqueDb } from "@youba/nestjs-dbvalidator";
import { CreateHospitalDto } from "@src/core/employees/dto/hospital.dto";

export class UpdatePatientDto {
  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({ example: "M", required: true })
  @IsOptional()
  sex?: string;

  @ApiProperty({ example: "123 Main St", required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: "1234567890", required: false })
  @IsOptional()
  //@Validate(isUniqueDb, ["patient", "personalPhone", "El teléfono personal ya existe"])
  @IsNumberString()
  personalPhone?: string;

  @ApiProperty({ example: "0987654321", required: false })
  @IsOptional()
  //@Validate(isUniqueDb, ["patient", "homePhone", "El teléfono de casa ya existe"])
  @IsNumberString()
  homePhone?: string;

  @ApiProperty({ type: () => CreateHospitalDto, required: false })
  @IsOptional()
  @Type(() => CreateHospitalDto)
  @ValidateNested()
  hospital?: CreateHospitalDto;

  @ApiProperty({ example: "2022-12-31", required: false })
  @IsOptional()
  @IsString()
  surgeryDate?: string;

  @ApiProperty({ example: "Appendectomy", required: false })
  @IsOptional()
  @IsString()
  surgeryProcedure?: string;

  @ApiProperty({ enum: SurgeryType, example: SurgeryType.SURGERYTYPE1, required: false })
  @IsOptional()
  @IsEnum(SurgeryType)
  surgeryType?: SurgeryType;

  @ApiProperty({ example: true, required: true })
  @IsOptional()
  @IsBoolean()
  automaticTracking?: boolean;

  @ApiProperty({ enum: StatusPatient, example: StatusPatient.ACTIVE })
  @IsOptional()
  @IsEnum(StatusPatient, { message: "Status invalido" })
  status?: StatusPatient;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  medicId?: number;

  @ApiProperty({ type: UpdateUserDto, required: true })
  @IsOptional()
  @Type(() => UpdateUserDto)
  @ValidateNested()
  user?: UpdateUserDto;
}
