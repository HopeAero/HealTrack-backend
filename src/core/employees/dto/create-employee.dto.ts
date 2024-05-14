import { IsNotEmpty, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { Hospital } from "../entities/hospital.entity";
import { CreateHospitalDto } from "./hospital.dto";
import { CreateUserDto } from "@src/core/users/dto/create-user.dto";

export class CreateEmployeeDto {
  @ApiProperty({ type: CreateHospitalDto, required: true })
  @IsNotEmpty()
  @Type(() => Hospital)
  @ValidateNested()
  hospital: Hospital;

  @ApiProperty({ type: CreateUserDto, required: true })
  @IsNotEmpty()
  @Type(() => CreateUserDto)
  @ValidateNested()
  user: CreateUserDto;
}
