import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsDateString, IsInt, Min } from "class-validator";

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

  @ApiPropertyOptional({ description: "Número de página para la paginación", example: 1 })
  @IsOptional()
  @IsString()
  page?: number;

  @ApiPropertyOptional({ description: "Cantidad de resultados por página", example: 10 })
  @IsOptional()
  @IsString()
  limit?: number;
}
