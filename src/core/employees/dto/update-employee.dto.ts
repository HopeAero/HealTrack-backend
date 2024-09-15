import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, ValidateNested } from "class-validator";
import { Hospital } from "../entities/hospital.entity";
import { Type } from "class-transformer";
import { CreateHospitalDto } from "./hospital.dto";
import { UpdateUserDto } from "@src/core/users/dto/update-user.dto";

export class UpdateEmployeeDto {
  @ApiProperty({ type: CreateHospitalDto })
  @IsOptional()
  @Type(() => Hospital)
  @ValidateNested()
  hospital: Hospital;

  @ApiProperty({ type: UpdateUserDto, required: true })
  @IsOptional()
  @Type(() => UpdateUserDto)
  @ValidateNested()
  user: UpdateUserDto;
}
