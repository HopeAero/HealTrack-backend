import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

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
