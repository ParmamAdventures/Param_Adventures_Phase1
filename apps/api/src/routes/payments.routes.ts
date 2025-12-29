import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { createPaymentIntent } from "../controllers/createPaymentIntent.controller";
import { verifyPayment } from "../controllers/verifyPayment.controller";

const router = Router();

router.post("/intent", requireAuth, createPaymentIntent);
router.post("/verify", requireAuth, verifyPayment);

export default router;
