import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(["name"])
export class Surgery {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
  @Column()
  @IsString()
  name: string;
}
