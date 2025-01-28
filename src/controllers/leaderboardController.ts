import { Request, Response } from "express";
import { User } from "../entities/User";
import { AppDataSource } from "../config/database";

export class LeaderboardController {
  private userRepository = AppDataSource.getRepository(User);

  public getLeaderboard = async (_: Request, res: Response): Promise<void> => {
    try {
      const topPlayers = await this.userRepository.find({
        select: ["id", "username", "wins", "losses", "draws"],
        order: {
          wins: "DESC",
        },
        take: 10,
      });

      res.json(topPlayers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  };

  public getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ["id", "username", "wins", "losses", "draws"],
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  };
}
