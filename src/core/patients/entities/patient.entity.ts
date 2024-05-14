import { ApiProperty } from "@nestjs/swagger";
import { StatusPatient } from "@src/constants/status/statusPatient";
import { SurgeryType } from "@src/constants/surgery/type";
import { Employee } from "@src/core/employees/entities/employee.entity";
import { Hospital } from "@src/core/employees/entities/hospital.entity";
import { User } from "@src/core/users/entities/user.entity";

import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Patient {
  @ApiProperty()
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ApiProperty()
  @OneToOne(() => User, (user) => user.patient)
  user: User;

  @ApiProperty()
  @Column()
  age: number;

  @ApiProperty()
  @Column({ default: "", nullable: true })
  address: string;

  @ApiProperty()
  @Column({ unique: true })
  personalPhone: string;

  @ApiProperty()
  @Column({ default: "", nullable: true, unique: true })
  homePhone: string;

  @ApiProperty({ type: () => Hospital })
  @Column("jsonb", { nullable: false, default: {} })
  hospital: Hospital;

  @ApiProperty()
  @Column({ type: "date" })
  surgeryDate: string;

  @ApiProperty()
  @Column()
  surgeryProcedure: string;

  @ApiProperty({ enum: SurgeryType })
  @Column({
    type: "enum",
    enum: SurgeryType,
  })
  surgeryType: SurgeryType;

  @ApiProperty()
  @Column("bool", { default: false })
  automaticTracking: boolean;

  @ApiProperty()
  @Column({
    type: "enum",
    enum: StatusPatient,
    default: StatusPatient.ACTIVE,
  })
  status: StatusPatient;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.patients)
  @JoinColumn({ name: "employeeId" })
  medic: Employee;
}
