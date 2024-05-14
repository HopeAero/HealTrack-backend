import { ApiProperty } from '@nestjs/swagger';
import { SurgeryType } from '@src/constants/surgery/type';
import { Chat } from '@src/core/chat/entities/chat.entity';
import { Employee } from '@src/core/employees/entities/employee.entity';
import { Hospital } from '@src/core/employees/entities/hospital.entity';

import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Patient {
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
  @Column()
  age: number;

  @ApiProperty()
  @Column({default: '', nullable: true})
  address: string;

  @ApiProperty()
  @Column({ unique: true })
  personalPhone: string;

  @ApiProperty()
  @Column({default: '', nullable: true, unique: true})
  homePhone: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column({ unique: true, nullable: false})
  identification: string;

  @ApiProperty({ type: () => Hospital })
  @Column('jsonb', { nullable: false, default: {} })
  hospital: Hospital;

  @ApiProperty()
  @Column({ nullable: false, select: false })
  password: string;

  @ApiProperty()
  @Column('bool', { default: false , select: false})
  isVerify: boolean;

  @ApiProperty()
  @Column({ type: 'date' })  
  surgeryDate: string;

  @ApiProperty()
  @Column()
  surgeryProcedure: string;

  @ApiProperty({ enum: SurgeryType })
  @Column({
    type: 'enum',
    enum: SurgeryType,
  })
  surgeryType: SurgeryType;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.patients)
  @JoinColumn({ name: 'employeeId' })
  medic: Employee;

  @ManyToMany((type) => Chat, (chat: Chat) => chat.patients)
  public chats: Chat[];
}
