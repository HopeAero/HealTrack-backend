import { ApiProperty } from "@nestjs/swagger";
import { AllRole } from "@src/constants";
import { Chat } from "@src/core/chats/entities/chat.entity";
import { Employee } from "@src/core/employees/entities/employee.entity";
import { MessageNotification } from "@src/core/messageNotifications/entities/messageNotifications.entity";
import { Message } from "@src/core/messagges/entities/messagge.entity";
import { Patient } from "@src/core/patients/entities/patient.entity";
import { ReportMedic } from "@src/core/reports/entities/report.entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
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

  @OneToMany(() => Message, (message: Message) => message.user)
  public message: Message;

  @OneToMany(() => Chat, (chat: Chat) => chat.created_by)
  public createdChats: Chat[];

  @ManyToMany((type) => Chat, (chat: Chat) => chat.users)
  public chats: Chat[];

  @OneToMany((type) => ReportMedic, (report: ReportMedic) => report.user)
  report: ReportMedic[];

  @ApiProperty({ type: () => MessageNotification })
  @OneToMany(() => MessageNotification, (messageNotifications) => messageNotifications.user)
  messageNotifications: MessageNotification[];

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
