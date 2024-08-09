import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "@src/core/employees/entities/employee.entity";

@Entity()
export class Notification {
  @ApiProperty()
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ApiProperty({ example: "Emergency Alert" })
  @Column()
  title: string;

  @ApiProperty({ example: "The patient with ID 123 has triggered the panic button." })
  @Column()
  message: string;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: () => Employee })
  @ManyToOne(() => Employee, (employee) => employee.notifications, { nullable: false })
  employee: Employee;
}
