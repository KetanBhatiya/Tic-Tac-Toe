import express from "express";
import { AppDataSource, initializeDataSource } from "./config/database";
import { config } from "./config/env.config";
import * as http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import authRouter from "./routes/authRoutes";
import gameRouter from "./routes/gameRoutes";
import leaderboardRouter from "./routes/leaderboardRoutes";
import jwt from "jsonwebtoken";
import rooms, {
  createRoom,
  joinRoom,
  makeMove,
  resetRoomStateForRematch,
} from "./services/room.service";
import { User } from "./entities/User";

const PORT = config.PORT;

initializeDataSource();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });

const JWT_SECRET = config.JWT_SECRET;

//Validating the user before connecting to the socket
io.use(async (socket, next) => {
  const token = socket.handshake.headers.token as string;
  console.log(token);
  if (!token) {
    return next(new Error("Authentication error: Token not provided"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // Check if the user exists in the database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Attach the user to the socket instance
    socket.data.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

const rematchRequests: Record<string, Set<string>> = {};
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create a room
  socket.on("create-room", ({ roomName, isPrivate }, callback) => {
    try {
      const room = createRoom(roomName, isPrivate, socket.id);
      console.log(room.id);
      socket.join(room.id);
      io.emit("room-created", room); // Notify all users about the new room
    } catch (error) {
      callback({ success: false, message: (error as Error).message });
    }
  });

  // Join a room
  socket.on("join-room", ({ roomId, isSpectator }, callback) => {
    try {
      const room = joinRoom(roomId, socket.id, isSpectator);
      socket.join(room.id);
      io.to(room.id).emit("room-joined", room); // Notify players and spectators
    } catch (error) {
      callback({ success: false, message: (error as Error).message });
    }
  });

  // Make a move
  socket.on("make-move", ({ roomId, row, col }, callback) => {
    try {
      const { board, winner } = makeMove(roomId, socket.id, row, col);
      io.to(roomId).emit("update-board", { board });

      if (winner) {
        io.to(roomId).emit("game-ended", { winner });
      }
    } catch (error) {
      callback({ success: false, message: (error as Error).message });
    }
  });

  //Sending rematch request
  socket.on(
    "request-rematch",
    (
      roomId: string,
      callback: (response: { success: boolean; message: string }) => void
    ) => {
      try {
        if (!rematchRequests[roomId]) {
          rematchRequests[roomId] = new Set();
        }

        rematchRequests[roomId].add(socket.data.user.id);

        // Notify the other player about the rematch request
        socket
          .to(roomId)
          .emit("rematch-requested", { requestingPlayer: socket.data.user.id });

        // If both players agree to a rematch
        if (rematchRequests[roomId].size === 2) {
          const updatedRoom = resetRoomStateForRematch(roomId);

          // Broadcast the reset game state to both players
          io.to(roomId).emit("rematch-started", {
            success: true,
            board: updatedRoom.boardState,
            currentTurn: updatedRoom.currentTurn,
          });

          // Clear the rematch requests
          delete rematchRequests[roomId];
        } else {
          if (typeof callback === "function") {
            callback({
              success: true,
              message: "Rematch request sent. Waiting for opponent...",
            });
          }
        }
      } catch (error) {
        if (typeof callback === "function") {
          callback({ success: false, message: (error as Error).message });
        }
      }
    }
  );
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use(cors({ origin: "*", credentials: true }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/games", gameRouter);
app.use("/api/leaderboard", leaderboardRouter);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
