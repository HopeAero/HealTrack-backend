import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class UpdateSurgeryDto {
    @ApiProperty({
        description: "The name of the surgery",
        example: "Rotura de Tobillo",
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;
}
  