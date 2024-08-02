import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Recommendation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;
}
