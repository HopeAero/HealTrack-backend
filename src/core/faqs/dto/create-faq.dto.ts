import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreateFAQDto {
  @ApiProperty({ example: "What is the procedure for surgery?", required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  question: string;

  @ApiProperty({ example: "The procedure involves...", required: true })
  @IsNotEmpty()
  @IsString()
  answer: string;
}
