import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAppFormularyDto {
  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Me gustaría usar esta herramienta más frecuentemente",
  })
  @IsNotEmpty()
  @IsString()
  likeApp: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Considero que esta herramienta es innecesariamente compleja",
  })
  @IsNotEmpty()
  @IsString()
  innescesaryDificultToUse: string;

  @ApiProperty({ example: "Totalmente de acuerdo", description: "Considero que la herramienta es fácil de usar" })
  @IsNotEmpty()
  @IsString()
  easyToUse: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Considero necesario el apoyo de personal experto para poder utilizar esta herramienta",
  })
  @IsNotEmpty()
  @IsString()
  needExpertSupport: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Considero que las funciones de la herramienta están bien integradas",
  })
  @IsNotEmpty()
  @IsString()
  wellIntegratedFunctions: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Considero que la herramienta presenta muchas contradicciones",
  })
  @IsNotEmpty()
  @IsString()
  manyContradictions: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Imagino que la mayoría de las personas aprenderían a usar esta herramienta rápidamente",
  })
  @IsNotEmpty()
  @IsString()
  peopleLearnQuickly: string;

  @ApiProperty({ example: "Totalmente de acuerdo", description: "Considero que el uso de esta herramienta es tedioso" })
  @IsNotEmpty()
  @IsString()
  tediousToUse: string;

  @ApiProperty({ example: "Totalmente de acuerdo", description: "Me sentí muy confiado al usar la herramienta" })
  @IsNotEmpty()
  @IsString()
  feltConfidentUsing: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Necesité saber bastantes cosas antes de poder empezar a usar esta herramienta",
  })
  @IsNotEmpty()
  @IsString()
  neededKnowledgeBeforeUse: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  isRespondingForEmployee: boolean;

  @ApiProperty({ example: "Se podría mejorar..." })
  @IsOptional()
  @IsString()
  additionalInformation: string;
}
