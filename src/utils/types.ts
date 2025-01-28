export interface PlayerConnection {
  userId: string;
  socketId: string;
  currentRoom: string | null;
}

export interface GameMove {
  position: number;
  userId: string;
}

export interface GameState {
  roomId: string;
  board: string[];
  currentTurn: string;
  status: "waiting" | "active" | "finished";
  winner?: string;
  isDraw?: boolean;
  players: {
    player1: string;
    player2?: string;
  };
}

export interface ValidationError {
  message: string;
}
