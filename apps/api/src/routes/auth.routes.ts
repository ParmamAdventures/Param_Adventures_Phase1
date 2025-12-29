import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  me,
  loginPage,
  forgotPassword,
  resetPassword,
  changePassword
} from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

import { authLimiter } from "../config/rate-limit";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Email already exists
 */
router.post("/register", authLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to get access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 user: { type: object }
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authLimiter, validate(loginSchema), login);

router.get("/login", loginPage);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid refresh token
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and clear cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/logout", logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Not authenticated
 */
router.get("/me", requireAuth, me);

router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/change-password", requireAuth, changePassword);

export default router;
