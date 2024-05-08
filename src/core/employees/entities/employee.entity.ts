import { ApiProperty } from '@nestjs/swagger';
import { EmployeeRole } from '../../../constants/index';

import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
  @Column({ nullable: false, select: false })
  identification: string;

  @Column({ nullable: false, select: false })
  password: string;

  @ApiProperty({ example: true })
  @Column('bool', { default: false })
  isVerify: boolean;

  @ApiProperty({ enum: EmployeeRole })
  @Column({
    type: 'enum',
    enum: EmployeeRole,
  })
  role: EmployeeRole;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;
}