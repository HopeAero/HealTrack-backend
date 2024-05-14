import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, ValidateNested } from "class-validator";
import { Hospital } from "../entities/hospital.entity";
import { Type } from "class-transformer";
import { CreateHospitalDto } from "./hospital.dto";

export class UpdateEmployeeDto {
  @ApiProperty({ type: CreateHospitalDto, required: true })
  @IsOptional()
  @Type(() => Hospital)
  @ValidateNested()
  hospital: Hospital;
}
