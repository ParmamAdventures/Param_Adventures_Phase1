
import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { getRefundHistory } from "../../controllers/admin/getRefundHistory.controller";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), getRefundHistory);

export default router;
