import { Router } from "express";
import { rawBodyMiddleware } from "../middlewares/rawBody.middleware";
import { razorpayWebhookHandler } from "../controllers/razorpayWebhook.controller";
import { globalLimiter } from "../config/rate-limit"; // Reuse global or create specific

const router = Router();

// Apply rate limiting to webhook endpoint to prevent DDoS
// Using globalLimiter (1000/15min) as a baseline, but specific one is better if high volume expected.
// For now, this adds basic protection.
router.post("/razorpay", globalLimiter, rawBodyMiddleware, razorpayWebhookHandler);

export default router;
