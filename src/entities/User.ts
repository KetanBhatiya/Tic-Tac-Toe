import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { GameRoom } from "./GameRoom";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;

  @Column({ default: 0 })
  draws: number;

  @OneToMany(() => GameRoom, (gameRoom) => gameRoom.createdBy)
  createdRooms: GameRoom[];
}
