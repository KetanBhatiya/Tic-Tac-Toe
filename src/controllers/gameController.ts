// src/controllers/gameController.ts
import { Request, Response } from "express";
import { GameRoom } from "../entities/GameRoom";
import { GameSession } from "../entities/GameSession";
import { User } from "../entities/User";
import { AppDataSource } from "../config/database";
import { generateJoinCode } from "../utils/codeGenerator";
import response from "../utils/response";
import { errorMessage, successMessage } from "../utils/constant.message";

export class GameController {
  private roomRepository = AppDataSource.getRepository(GameRoom);
  private sessionRepository = AppDataSource.getRepository(GameSession);
  private userRepository = AppDataSource.getRepository(User);

  public createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roomName, isPrivate } = req.body;
      const userId = (req as any).user.id;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        response.recordNotFound(
          { message: errorMessage.USER_NOT_FOUND, data: {} },
          res
        );
        return;
      }

      const room = this.roomRepository.create({
        roomName,
        isPrivate,
        createdBy: { id: user.id },
        joinCode: isPrivate ? generateJoinCode() : undefined,
      });

      await this.roomRepository.save(room);

      const session = this.sessionRepository.create({
        room,
        boardState: Array(9).fill(null),
        currentTurn: user,
      });

      await this.sessionRepository.save(session);

      response.successCreate(
        {
          data: { ...room },
          message: successMessage.CREATE("Room"),
        },
        res
      );
      return;
    } catch (error) {
      response.failureResponse(
        { message: (error as Error).message, data: {} },
        res,
        "gameController",
        "createRoom"
      );
      return;
    }
  };

  public joinRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roomId, joinCode } = req.body;
      const userId = (req as any).user.id;

      const room = await this.roomRepository.findOne({
        where: { id: roomId },
        relations: ["player2"],
      });

      if (!room) {
        response.recordNotFound(
          { message: errorMessage.NOT_FOUND("Room"), data: {} },
          res
        );
        return;
      }

      if (room.isPrivate && room.joinCode !== joinCode) {
        response.badRequest({ message: "Invalid join code", data: {} }, res);
        return;
      }

      if (room.status !== "waiting") {
        response.badRequest({ message: "Game already started", data: {} }, res);
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        response.recordNotFound(
          { message: errorMessage.USER_NOT_FOUND, data: {} },
          res
        );
        return;
      }

      room.player2 = user;
      room.status = "active";
      await this.roomRepository.save(room);

      const responseData = {
        ...room,
        player2: { id: room.player2.id },
      };

      response.successResponse(
        {
          data: { ...responseData },
          message: successMessage.ROOM("join"),
        },
        res
      );
      return;
    } catch (error) {
      response.failureResponse(
        { message: (error as Error).message, data: {} },
        res,
        "gameController",
        "joinRoom"
      );
      return;
    }
  };

  public listRooms = async (_: Request, res: Response): Promise<void> => {
    try {
      const rooms = await this.roomRepository.find({
        where: {
          isPrivate: false,
          status: "waiting",
        },
        relations: ["createdBy"],
        select: {
          id: true,
          roomName: true,
          isPrivate: true,
          joinCode: true,
          status: true,
          createdBy: {
            id: true,
            username: true,
          },
        },
      });

      response.successResponse(
        {
          data: { ...rooms },
          message: successMessage.ROOM("find"),
        },
        res
      );
      return;
    } catch (error) {
      response.failureResponse(
        { message: (error as Error).message, data: {} },
        res,
        "gameController",
        "listRooms"
      );
      return;
    }
  };

  public getRoomDetails = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { roomId } = req.params;

      const room = await this.roomRepository.findOne({
        where: { id: roomId },
        relations: ["createdBy", "player2"],
      });

      if (!room) {
        response.recordNotFound(
          { message: errorMessage.USER_NOT_FOUND, data: {} },
          res
        );
        return;
      }

      const responseData = {
        ...room,
        createdBy: { id: room.createdBy.id },
        player2: room.player2 ? { id: room.player2.id } : null,
      };
      response.successResponse(
        {
          data: { ...responseData },
          message: successMessage.ROOM("find"),
        },
        res
      );
      return;
    } catch (error) {
      response.failureResponse(
        { message: (error as Error).message, data: {} },
        res,
        "gameController",
        "getRoomDetails"
      );
      return;
    }
  };
}
