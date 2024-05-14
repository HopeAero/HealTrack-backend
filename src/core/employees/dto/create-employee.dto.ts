import { IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { Hospital } from "../entities/hospital.entity";
import { CreateHospitalDto } from "./hospital.dto";

export class CreateEmployeeDto {
  @ApiProperty({ type: CreateHospitalDto, required: true })
  @IsNotEmpty()
  @Type(() => Hospital)
  @ValidateNested()
  hospital: Hospital;
}
