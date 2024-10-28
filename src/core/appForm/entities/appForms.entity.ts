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
export class AppFormulary {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne((type) => User, (user: User) => user.appForm, {
    eager: true,
    cascade: true,
  })
  user: User;

  @ApiProperty({ example: true })
  @Column("bool", { nullable: true })
  isRespondingForEmployee: boolean;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Me gustaría usar esta herramienta mas frecuentemente",
  })
  @Column("text", { nullable: false, default: "Totalmente de acuerdo" })
  likeApp: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Considero que esta herramienta es innecesariamente compleja",
  })
  @Column("text", { nullable: false, default: "Totalmente de acuerdo" })
  innescesaryDificultToUse: string;

  @ApiProperty({ example: "Totalmente de acuerdo", description: "Considero que la herramienta es fácil de usar" })
  @Column("text", { nullable: false, default: "Totalmente de acuerdo" })
  easyToUse: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Considero necesario el apoyo de personal experto para poder utilizar esta herramienta",
  })
  @Column("text", { nullable: false, default: "Totalmente de acuerdo" })
  needExpertSupport: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Considero que las funciones de la herramienta están bien integradas",
  })
  @Column("text", { nullable: false, default: "Totalmente de acuerdo" })
  wellIntegratedFunctions: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Considero que la herramienta presenta muchas contradicciones",
  })
  @Column("text", { nullable: false, default: "Totalmente de acuerdo" })
  manyContradictions: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Imagino que la mayoría de las personas aprenderían a usar esta herramienta rápidamente",
  })
  @Column("text", { nullable: false, default: "Totalmente de acuerdo" })
  peopleLearnQuickly: string;

  @ApiProperty({ example: "Totalmente de acuerdo", description: "Considero que el uso de esta herramienta es tedioso" })
  @Column("text", { nullable: false, default: "Totalmente de acuerdo" })
  tediousToUse: string;

  @ApiProperty({ example: "Totalmente de acuerdo", description: "Me sentí muy confiado al usar la herramienta" })
  @Column("text", { nullable: false, default: "Totalmente de acuerdo" })
  feltConfidentUsing: string;

  @ApiProperty({
    example: "Totalmente de acuerdo",
    description: "Necesité saber bastantes cosas antes de poder empezar a usar esta herramienta",
  })
  @Column("text", { nullable: false, default: "Totalmente de acuerdo" })
  neededKnowledgeBeforeUse: string;

  @ApiProperty()
  @Column({ default: "", nullable: true })
  additionalInformation: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @DeleteDateColumn({ type: "timestamptz" })
  deletedAt: Date;
}
