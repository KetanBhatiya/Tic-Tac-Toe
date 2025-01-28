// src/routes/authRoutes.ts
import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { validateRegister, validateLogin } from "../middleware/validation";

const router = Router();
const authController = new AuthController();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);

export default router;
