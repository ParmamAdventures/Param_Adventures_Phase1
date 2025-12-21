import { Router } from "express";
import { updateProfile } from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.patch("/profile", requireAuth, updateProfile);

export default router;
