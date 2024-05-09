import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Hospital } from './hospital.entity';
import { EmployeeRole } from '@src/constants';
import { Patient } from '@src/core/patients/entities/patient.entity';

@Entity()
export class Employee {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  lastname: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column({ unique: true, nullable: false, select: false })
  identification: string;

  @Column({ nullable: false, select: false })
  password: string;

  @ApiProperty({ example: true })
  @Column('bool', { default: false })
  isVerify: boolean;

  @ApiProperty({ type: () => Hospital })
  @Column('jsonb', { nullable: false, default: {} })
  hospital: Hospital;

  @ApiProperty({ enum: EmployeeRole })
  @Column({
    type: 'enum',
    enum: EmployeeRole,
  })
  role: EmployeeRole;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Patient, (patient) => patient.medic)
  patients: Patient[];
}