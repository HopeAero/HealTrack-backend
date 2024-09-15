import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SendResetPasswordEmailDto {
  @ApiProperty({ example: "user@example.com", description: "Correo electrónico del usuario" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
