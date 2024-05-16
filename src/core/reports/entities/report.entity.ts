import { ApiProperty } from "@nestjs/swagger";
import { User } from "@src/core/users/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class ReportMedic {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne((type) => User, (user: User) => user.report, {
    eager: true,
    cascade: true,
  })
  user: User;

  @ApiProperty({ example: true })
  @Column("bool", { nullable: true })
  isAnswerByMedic: boolean;

  @ApiProperty({ example: true })
  @Column("bool", { nullable: false })
  temperature: boolean;

  @ApiProperty({ example: true })
  @Column("bool", { nullable: false })
  redness: boolean;

  @ApiProperty({ example: true })
  @Column("bool", { nullable: false })
  swelling: boolean;

  @ApiProperty({ example: true })
  @Column("bool", { nullable: false })
  secretions: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamptz" })
  deletedAt: Date;
}
