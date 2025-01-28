import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/types";
import response from "../utils/response";

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username, password } = req.body;

  if (!username || username.length < 3) {
    response.badRequest(
      {
        message: "Username must be at least 3 characters long",
        data: {},
      },
      res
    );
    return;
  }

  if (!password || password.length < 6) {
    response.badRequest(
      {
        message: "Password must be at least 6 characters long",
        data: {},
      },
      res
    );
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username, password } = req.body;

  if (!username) {
    response.badRequest(
      {
        message: "Username is required",
        data: {},
      },
      res
    );
    return;
  }

  if (!password) {
    response.badRequest(
      {
        message: "Password is required",
        data: {},
      },
      res
    );
    return;
  }

  next();
};

export const validateCreateRoom = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roomName } = req.body;
  if (!roomName || roomName.length < 3) {
    response.badRequest(
      {
        message: "Room name must be at least 3 characters long",
        data: {},
      },
      res
    );
    return;
  }

  next();
};

export const validateJoinRoom = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roomId } = req.body;

  if (!roomId) {
    response.badRequest(
      {
        message: "Room ID is required",
        data: {},
      },
      res
    );
    return;
  }
  next();
};
