import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { createPaymentIntent } from "../controllers/createPaymentIntent.controller";

const router = Router();

router.post("/intent", requireAuth, createPaymentIntent);

export default router;
