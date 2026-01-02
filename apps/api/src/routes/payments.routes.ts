import { createManualPayment } from "../controllers/createManualPayment.controller";
import { requirePermission } from "../middlewares/auth.middleware";

const router = Router();

router.post("/intent", requireAuth, createPaymentIntent);
router.post("/verify", verifyPayment);
router.post("/manual", requireAuth, requirePermission("trip:view:internal"), createManualPayment);

export default router;
