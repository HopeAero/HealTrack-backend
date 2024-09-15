import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength, Matches, IsNotEmpty, IsNumber } from "class-validator";

export class UpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  userEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "contraseña muy débil",
  })
  newPassword: string;
}
