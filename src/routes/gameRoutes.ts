// src/routes/gameRoutes.ts
import { Router } from "express";
import { GameController } from "../controllers/gameController";
import { authMiddleware } from "../middleware/auth";
import { validateCreateRoom, validateJoinRoom } from "../middleware/validation";

const router = Router();
const gameController = new GameController();

router.use(authMiddleware);

router.post("/rooms", validateCreateRoom, gameController.createRoom);
router.post("/rooms/join", validateJoinRoom, gameController.joinRoom);
router.get("/rooms", gameController.listRooms);
router.get("/rooms/:id", gameController.getRoomDetails);

export default router;
