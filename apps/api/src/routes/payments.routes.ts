import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";
import { createPaymentIntent } from "../controllers/payments/createPaymentIntent.controller";
import { verifyPayment } from "../controllers/payments/verifyPayment.controller";
import { createManualPayment } from "../controllers/payments/createManualPayment.controller";

const router = Router();

router.post("/intent", requireAuth, createPaymentIntent);
router.post("/verify", verifyPayment);
router.post("/manual", requireAuth, requirePermission("trip:view:internal"), createManualPayment);

export default router;
