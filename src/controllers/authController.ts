import { Request, Response } from "express";
import { User } from "../entities/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { config } from "../config/env.config";
import response from "../utils/response";
import { errorMessage, successMessage } from "../utils/constant.message";

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      const existingUser = await this.userRepository.findOne({
        where: { username },
      });

      if (existingUser) {
        response.badRequest(
          { message: errorMessage.USER_EXISTS, data: {} },
          res
        );
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({
        username,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      const token = jwt.sign(
        { id: user.id, username: user.username },
        config.JWT_SECRET
      );
      let { password: userPassword, ...user_data } = user;
      response.successCreate(
        {
          data: { ...user_data, jwt: token },
          message: successMessage.CREATE("User"),
        },
        res
      );
      return;
    } catch (error) {
      response.failureResponse(
        { message: (error as Error).message, data: {} },
        res,
        "authController",
        "register"
      );
      return;
    }
  };

  // Function to handle user login
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      const user = await this.userRepository.findOne({ where: { username } });
      if (!user) {
        response.badRequest(
          { message: errorMessage.INVALID_CREDENTIALS, data: {} },
          res
        );
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        response.badRequest(
          { message: errorMessage.INVALID_CREDENTIALS, data: {} },
          res
        );
        return;
      }

      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { id: user.id, username: user.username },
        config.JWT_SECRET
      );
      let { password: userPassword, ...user_data } = user;
      response.successResponse(
        {
          data: { ...user_data, jwt: token },
          message: successMessage.USER_LOGIN,
        },
        res
      );
    } catch (error) {
      response.failureResponse(
        { message: (error as Error).message, data: {} },
        res,
        "authController",
        "login"
      );
      return;
    }
  };
}
