import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateReportDto {
  @ApiProperty({ example: true, description: "Tiene temperatura mayor de 38,5 °C" })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  hasHighTemperature: boolean;

  @ApiProperty({ example: true, description: "Tiene enrojecimiento alrededor de la herida operatoria" })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  hasRedness: boolean;

  @ApiProperty({ example: true, description: "Tiene hinchazón en la herida operatoria" })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  hasSwelling: boolean;

  @ApiProperty({ example: true, description: "Presenta secreciones que salen a través de la herida operatoria" })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  hasSecretions: boolean;

  @ApiProperty({ example: "No", description: "¿Ha tenido algún gasto relacionado con la cirugía?" })
  @IsNotEmpty()
  @IsString()
  surgeryExpense: string;

  @ApiProperty({ example: 0.0, description: "Monto aproximado de los gastos relacionados con la cirugía" })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  surgeryExpenseAmount: number;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  isRespondingForEmployee: boolean;

  @ApiProperty({ example: "Presenta dolor de cabeza" })
  @IsOptional()
  @IsString()
  additionalInformation: string;

  @ApiProperty({ type: "string", format: "binary", description: "Attachment image" })
  @IsOptional()
  fileUrl: any;
}
