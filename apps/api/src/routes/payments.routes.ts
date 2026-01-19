import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";
import { createPaymentIntent } from "../controllers/payments/createPaymentIntent.controller";
import { verifyPayment } from "../controllers/payments/verifyPayment.controller";
import { createManualPayment } from "../controllers/payments/createManualPayment.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  createPaymentIntentSchema,
  verifyPaymentSchema,
  createManualPaymentSchema,
} from "../schemas/payment.schema";

const router = Router();

router.post("/intent", requireAuth, validate(createPaymentIntentSchema), createPaymentIntent);
router.post("/verify", requireAuth, validate(verifyPaymentSchema), verifyPayment);
router.post(
  "/manual",
  requireAuth,
  requirePermission("trip:view:internal"),
  validate(createManualPaymentSchema),
  createManualPayment,
);

export default router;
