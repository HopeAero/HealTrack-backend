import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSurgeryDto {
  @ApiProperty({
    description: "The name of the surgery",
    example: "Rotura de Tobillo",
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
