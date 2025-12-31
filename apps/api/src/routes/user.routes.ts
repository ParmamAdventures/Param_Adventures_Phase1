import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { updateProfile } from "../controllers/user.controller";
import { getGuideTrips } from "../controllers/admin/getGuideTrips.controller";

const router = Router();

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get current user profile (synonym for /auth/me)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/profile", requireAuth, (req, res) => {
  res.json(req.user);
});

/**
 * @swagger
 * /user/profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               bio: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch("/profile", requireAuth, updateProfile);

/**
 * @swagger
 * /user/guide/trips:
 *   get:
 *     summary: Get trips assigned to the current user as a guide
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned trips
 */
router.get("/guide/trips", requireAuth, getGuideTrips);

export default router;
