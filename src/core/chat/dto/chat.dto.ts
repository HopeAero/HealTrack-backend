import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '@src/core/employees/entities/employee.entity';
import { Patient } from '@src/core/patients/entities/patient.entity';
import { IsOptional, IsString } from 'class-validator';

export class ChatDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  patient: Patient[];

  @ApiProperty()
  @IsOptional()
   employee: Employee[];
}