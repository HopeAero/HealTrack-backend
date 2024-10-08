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
  isRespondingForEmployee: boolean;

  @ApiProperty({ example: true, description: "Tiene temperatura mayor de 38,5 °C" })
  @Column("bool", { nullable: false })
  hasHighTemperature: boolean;

  @ApiProperty({ example: true, description: "Tiene enrojecimiento alrededor de la herida operatoria" })
  @Column("bool", { nullable: false })
  hasRedness: boolean;

  @ApiProperty({ example: true, description: "Tiene hinchazón en la herida operatoria" })
  @Column("bool", { nullable: false })
  hasSwelling: boolean;

  @ApiProperty({ example: true, description: "Presenta secreciones que salen a través de la herida operatoria" })
  @Column("bool", { nullable: false })
  hasSecretions: boolean;

  @ApiProperty({ example: "No", description: "Ha tenido algún gasto relacionado con la cirugía" })
  @Column("text", { nullable: false, default: "No" })
  surgeryExpense: string;

  @ApiProperty({ example: 0.0, description: "Monto aproximado de los gastos relacionados con la cirugía" })
  @Column("float", { nullable: false, default: 0.0 })
  surgeryExpenseAmount: number;

  @ApiProperty()
  @Column({ default: "", nullable: true })
  additionalInformation: string;

  @ApiProperty()
  @Column("text", { nullable: true })
  fileUrl: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamptz" })
  deletedAt: Date;
}
