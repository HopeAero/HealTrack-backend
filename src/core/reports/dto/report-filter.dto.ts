import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsDateString } from "class-validator";

export class ReportFilterDto {
  @ApiPropertyOptional({ description: "Fecha de inicio para filtrar", type: String, format: "date-time" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: "Fecha de fin para filtrar", type: String, format: "date-time" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: "ID del usuario para filtrar por paciente" })
  @IsOptional()
  @IsString()
  userId?: string;
}
