import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "@src/core/users/entities/user.entity";

@Entity()
export class MessageNotification {
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
  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.messageNotifications, { nullable: false })
  user: User;
}
