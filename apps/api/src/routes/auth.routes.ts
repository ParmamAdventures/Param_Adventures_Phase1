import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  me,
  loginPage,
} from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

import { authLimiter } from "../config/rate-limit";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/login", loginPage);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
