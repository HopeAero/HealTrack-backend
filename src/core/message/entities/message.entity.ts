import { ApiProperty } from "@nestjs/swagger";
import { Chat } from "@src/core/chat/entities/chat.entity";
import { Employee } from "@src/core/employees/entities/employee.entity";
import { Patient } from "@src/core/patients/entities/patient.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Message {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column('text')
    message: string;

    @ManyToOne(() => Chat, {
        eager: false,
        cascade: true,
      })
    public chat: Chat;

    @ManyToOne(() => Employee, {
        eager: true,
        cascade: true,
      })
    @JoinColumn()
    public employee: Employee;

    @ManyToOne(() => Patient, {
        eager: true,
        cascade: true,
      })
    @JoinColumn()
    public patient: Patient;
    

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
