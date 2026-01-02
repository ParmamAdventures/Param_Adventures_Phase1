import { Router } from "express";
import { requireAuth, requirePermission } from "../middlewares/auth.middleware";
import { createPaymentIntent } from "../controllers/createPaymentIntent.controller";
import { verifyPayment } from "../controllers/verifyPayment.controller";
import { createManualPayment } from "../controllers/createManualPayment.controller";

const router = Router();

router.post("/intent", requireAuth, createPaymentIntent);
router.post("/verify", verifyPayment);
router.post("/manual", requireAuth, requirePermission("trip:view:internal"), createManualPayment);

export default router;
