type Room = {
  id: string;
  roomName: string;
  players: string[]; // Player socket IDs
  spectators: string[]; // Spectator socket IDs
  isPrivate: boolean;
  joinCode?: string;
  boardState: string[][]; // 3x3 board
  currentTurn: string; // Socket ID of the player whose turn it is
  status: "waiting" | "active" | "completed";
};

export const rooms: Record<string, Room> = {};

// Create a new game room
export const createRoom = (
  roomName: string,
  isPrivate: boolean,
  createdBy: string
): Room => {
  const roomId = Math.random().toString(36).substring(2, 10); // Generate unique room ID
  const joinCode = isPrivate
    ? Math.random().toString(36).substring(2, 8)
    : undefined;

  rooms[roomId] = {
    id: roomId,
    roomName,
    players: [createdBy],
    spectators: [],
    isPrivate,
    joinCode,
    boardState: Array.from({ length: 3 }, () => Array(3).fill("")), // Properly initialize empty board
    currentTurn: createdBy,
    status: "waiting",
  };

  return rooms[roomId];
};

// Join a game room
export const joinRoom = (
  roomId: string,
  playerId: string,
  isSpectator: boolean
): Room => {
  const room = rooms[roomId];
  if (!room) throw new Error("Room not found");
  if (!isSpectator && room.players.length >= 2) throw new Error("Room is full");

  if (isSpectator) {
    room.spectators.push(playerId);
  } else {
    room.players.push(playerId);
    room.status = "active"; // Start game when 2 players join
  }

  return room;
};

// Make a move in the game
export const makeMove = (
  roomId: string,
  playerId: string,
  row: number,
  col: number
): { board: string[][]; winner?: string } => {
  const room = rooms[roomId];
  if (!room) throw new Error("Room not found");
  if (room.currentTurn !== playerId) throw new Error("Not your turn");

  // Clone the board to avoid mutating shared references
  const board = room.boardState.map((row) => [...row]);

  if (board[row][col] !== "") throw new Error("Cell already occupied");

  // Place the player's move (X or O)
  board[row][col] = room.players[0] === playerId ? "X" : "O";
  room.boardState = board;

  // Switch turns
  room.currentTurn =
    room.players[0] === playerId ? room.players[1] : room.players[0];

  // Check for a winner or draw
  const winner = checkWinner(board);
  if (winner) {
    room.status = "completed";
    return { board, winner };
  }

  return { board };
};

// Reset the room state for a rematch
export const resetRoomStateForRematch = (roomId: string): Room => {
  const room = rooms[roomId];
  if (!room) throw new Error("Room not found");

  room.boardState = Array.from({ length: 3 }, () => Array(3).fill("")); // Reset 3x3 board
  room.currentTurn = room.players[0]; // Player 1 starts the rematch
  room.status = "active"; // Set status to active

  return room;
};

// Check for a winner
const checkWinner = (board: string[][]): string | null => {
  const lines = [
    ...board, // Rows
    ...board[0].map((_, col) => board.map((row) => row[col])), // Columns
    [board[0][0], board[1][1], board[2][2]], // Diagonal 1
    [board[0][2], board[1][1], board[2][0]], // Diagonal 2
  ];

  for (const line of lines) {
    if (line.every((cell) => cell === "X")) return "X";
    if (line.every((cell) => cell === "O")) return "O";
  }

  if (board.flat().every((cell) => cell !== "")) return "Draw"; // Draw if no empty cells
  return null;
};

export default rooms;
