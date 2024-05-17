import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class CreateReportDto {
  @ApiProperty({ example: true, description: "Tiene temperatura mayor de 38,5 °C" })
  @IsNotEmpty()
  @IsBoolean()
  hasHighTemperature: boolean;

  @ApiProperty({ example: true, description: "Tiene enrojecimiento alrededor de la herida operatoria" })
  @IsNotEmpty()
  @IsBoolean()
  hasRedness: boolean;

  @ApiProperty({ example: true, description: "Tiene hinchazón en la herida operatoria" })
  @IsNotEmpty()
  @IsBoolean()
  hasSwelling: boolean;

  @ApiProperty({ example: true, description: "Presenta secreciones que salen a través de la herida operatoria" })
  @IsNotEmpty()
  @IsBoolean()
  hasSecretions: boolean;
}
