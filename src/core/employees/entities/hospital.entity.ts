import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hospital {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @ApiProperty()
  @IsString()
  name: string;
}