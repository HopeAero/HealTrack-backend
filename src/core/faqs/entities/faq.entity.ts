import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FAQ {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column()
  answer: string;
}
