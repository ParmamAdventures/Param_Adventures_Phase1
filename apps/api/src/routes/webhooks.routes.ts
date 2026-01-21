import { Router } from "express";
import { rawBodyMiddleware } from "../middlewares/rawBody.middleware";
import { razorpayWebhookHandler } from "../controllers/razorpayWebhook.controller";

import { webhookLimiter } from "../config/rate-limit";

const router = Router();

router.post("/razorpay", webhookLimiter, rawBodyMiddleware, razorpayWebhookHandler);

export default router;
