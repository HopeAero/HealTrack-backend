import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({ example: "newpassword123", description: "Nueva contraseña del usuario" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
