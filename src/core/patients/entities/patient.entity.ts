import { ApiProperty } from "@nestjs/swagger";
import { StatusPatient } from "@src/constants/status/statusPatient";
import { SurgeryType } from "@src/constants/surgery/type";
import { Employee } from "@src/core/employees/entities/employee.entity";
import { Hospital } from "@src/core/employees/entities/hospital.entity";
import { Notification } from "@src/core/notifications/entities/notification.entity";
import { User } from "@src/core/users/entities/user.entity";
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

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
  @Column({ default: "M", nullable: false })
  sex: string;

  @ApiProperty()
  @Column({ default: "", nullable: true })
  address: string;

  @ApiProperty()
  @Column()
  personalPhone: string;

  @ApiProperty()
  @Column({ default: "", nullable: true })
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

  @ManyToOne(() => Employee, (employee) => employee.patients)
  @JoinColumn({ name: "asistantId" })
  asistant: Employee;

  @ApiProperty({ type: () => Notification })
  @OneToMany(() => Notification, (notification) => notification.patient)
  notifications: Notification[];
}
