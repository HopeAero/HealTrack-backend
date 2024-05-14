import { ApiProperty } from "@nestjs/swagger";

import { Column, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Hospital } from "./hospital.entity";
import { Patient } from "@src/core/patients/entities/patient.entity";
import { User } from "@src/core/users/entities/user.entity";

@Entity()
export class Employee {
  @ApiProperty()
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ApiProperty()
  @OneToOne(() => User, (user) => user.employee)
  user: User;

  @ApiProperty({ type: () => Hospital })
  @Column("jsonb", { nullable: false, default: {} })
  hospital: Hospital;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Patient, (patient) => patient.medic)
  patients: Patient[];
}
