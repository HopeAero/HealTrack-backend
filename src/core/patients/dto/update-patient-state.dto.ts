import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsEnum } from "class-validator";
import { StatusPatient } from "@src/constants/status/statusPatient";

export class UpdatePatientStateDto {
  @ApiProperty({ enum: StatusPatient, example: StatusPatient.ACTIVE })
  @IsOptional()
  @IsEnum(StatusPatient, { message: "Status invalido" })
  status: StatusPatient;
}
