import { ApiProperty } from "@nestjs/swagger";
import { AllRole } from "@src/constants";
import { Employee } from "@src/core/employees/entities/employee.entity";
import { Patient } from "@src/core/patients/entities/patient.entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToOne(() => Patient, (patient) => patient.user)
  @JoinColumn()
  patient: Patient;

  @OneToOne(() => Employee, (employee) => employee.user)
  @JoinColumn()
  employee: Employee;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  lastname: string;

  @ApiProperty()
  @Column({ nullable: false, select: false })
  password: string;

  @ApiProperty()
  @Column({ unique: true, nullable: false })
  email: string;

  @ApiProperty()
  @Column({ unique: true, nullable: false })
  identification: string;

  @ApiProperty({ enum: AllRole })
  @Column({
    type: "enum",
    enum: AllRole,
  })
  role: AllRole;

  @ApiProperty({ example: true })
  @Column("bool", { default: false, select: false })
  isVerify: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;
}
