import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { GameRoom } from "./GameRoom";

@Entity()
export class GameSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => GameRoom, (room) => room.currentSession)
  @JoinColumn()
  room: GameRoom;

  @Column("simple-array")
  boardState: string[];

  @ManyToOne(() => User)
  currentTurn: User;

  @ManyToOne(() => User, { nullable: true })
  winner: User;

  @Column({ default: false })
  isDraw: boolean;

  @Column("simple-array", { nullable: true })
  spectators: string[];
}
