import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { AppDataSource } from "../config/database";
import { config } from "../config/env.config";
import { errorMessage } from "../utils/constant.message";
import response from "../utils/response";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
}

interface JwtPayload {
  id: string;
  username: string;
  iat?: number;
  exp?: number;
}

export class AuthMiddleware {
  private static readonly JWT_SECRET = config.JWT_SECRET;
  private static readonly userRepository = AppDataSource.getRepository(User);

  public static authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        response.badRequest(
          { message: errorMessage.MISSING_TOKEN, data: {} },
          res
        );
        return;
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        response.badRequest(
          { message: errorMessage.INVALID_TOKEN, data: {} },
          res
        );
        return;
      }

      try {
        const decoded = jwt.verify(
          token,
          AuthMiddleware.JWT_SECRET
        ) as JwtPayload;

        const user = await AuthMiddleware.userRepository.findOne({
          where: { id: decoded.id },
        });
        if (!user) {
          response.recordNotFound(
            { message: errorMessage.USER_NOT_FOUND, data: {} },
            res
          );
          return;
        }

        req.user = {
          id: decoded.id,
          username: decoded.username,
        };

        next();
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          response.badRequest(
            { message: errorMessage.TOKEN_EXPIRED, data: {} },
            res
          );
          return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
          response.badRequest(
            { message: errorMessage.INVALID_TOKEN, data: {} },
            res
          );
          return;
        }

        throw error;
      }
    } catch (error) {
      console.error("Auth middleware error:", error);
      response.failureResponse(
        { message: (error as Error).message, data: {} },
        res,
        "gameController",
        "createRoom"
      );
      return;
    }
  };

  public static generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      AuthMiddleware.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
  }

  public static authenticateSocket = async (
    token: string
  ): Promise<User | null> => {
    try {
      if (!token) {
        return null;
      }

      const decoded = jwt.verify(
        token,
        AuthMiddleware.JWT_SECRET
      ) as JwtPayload;
      const user = await AuthMiddleware.userRepository.findOne({
        where: { id: decoded.id },
      });

      return user || null;
    } catch (error) {
      console.error("Socket authentication error:", error);
      return null;
    }
  };
}

export const authMiddleware = AuthMiddleware.authenticate;
export const generateToken = AuthMiddleware.generateToken;
export const authenticateSocket = AuthMiddleware.authenticateSocket;
