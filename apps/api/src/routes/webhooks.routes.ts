import { Router } from "express";
import { rawBodyMiddleware } from "../middleware/rawBody.middleware";
import { razorpayWebhookHandler } from "../controllers/razorpayWebhook.controller";

const router = Router();

router.post("/razorpay", rawBodyMiddleware, razorpayWebhookHandler);

export default router;
