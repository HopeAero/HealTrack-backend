import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateHospitalDto {
  @ApiProperty({
    description: "The name of the hospital",
    example: "General Hospital",
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateHospitalDto {
  @ApiProperty({
    description: "The name of the hospital",
    example: "General Hospital",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
