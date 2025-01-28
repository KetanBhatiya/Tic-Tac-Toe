import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { User } from "./User";
import { GameSession } from "./GameSession";

@Entity()
export class GameRoom {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  roomName: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ nullable: true })
  joinCode: string;

  @Column({
    type: "enum",
    enum: ["waiting", "active", "finished"],
    default: "waiting",
  })
  status: "waiting" | "active" | "finished";

  @ManyToOne(() => User, (user) => user.createdRooms)
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  player2: User;

  @OneToOne(() => GameSession, (session) => session.room)
  currentSession: GameSession;
}
