import { Message } from "@src/core/messagges/entities/messagge.entity";
import { User } from "@src/core/users/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "chats" })
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  title: string;

  @Column("int", { default: 0 })
  unread_messages_count: number;

  @ManyToOne(() => User, {
    eager: true,
    cascade: true,
  })
  @JoinTable()
  public created_by: User;

  @ManyToMany((type) => User, (user: User) => user.chats, {
    eager: true,
    cascade: true,
  })
  @JoinTable()
  users: User[];

  @OneToMany(() => Message, (message: Message) => message.chat)
  public messages: Message[];

  @OneToOne(() => Message, (message: Message) => message.chat)
  public last_message: Message;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  constructor(data: Chat) {
    super();
  }
}

function OrderBy(arg0: string, arg1: string): (target: Chat, propertyKey: "last_message") => void {
  throw new Error("Function not implemented.");
}
