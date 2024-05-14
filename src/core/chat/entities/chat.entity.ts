import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '@src/core/employees/entities/employee.entity';
import { Message } from '@src/core/message/entities/message.entity';
import { Patient } from '@src/core/patients/entities/patient.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinTable, ManyToMany } from 'typeorm';


@Entity()
export class Chat {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column('text')
    title: string;

    @ManyToMany(() => Patient, (patient: Patient) => patient.chats, {
        eager: true,
        cascade: true,
    })
    @JoinTable()
    patients: Patient[];

    @ManyToMany(() => Employee, (employee: Employee) => employee.chats, {
        eager: true,
        cascade: true,
    })
    @JoinTable()
    employees: Employee[];

    @OneToMany(() => Message, (message: Message) => message.chat)
    public messages: Message[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt: Date;
}