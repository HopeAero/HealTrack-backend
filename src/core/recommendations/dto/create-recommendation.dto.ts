import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreateRecommendationDto {
  @ApiProperty({ example: "How to manage stress", required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: "Stress management tips and techniques...", required: true })
  @IsNotEmpty()
  @IsString()
  content: string;
}
