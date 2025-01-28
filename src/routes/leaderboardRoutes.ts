import { Router } from "express";
import { LeaderboardController } from "../controllers/leaderboardController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const leaderboardController = new LeaderboardController();

router.use(authMiddleware);

router.get("/", leaderboardController.getLeaderboard);
router.get("/user-stats", leaderboardController.getUserStats);

export default router;
