import { Router } from "express";
import { listInquiries, updateInquiryStatus } from "../../controllers/admin/inquiry.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";

const router = Router();

// Protect all routes
router.use(requireAuth, attachPermissions, requirePermission("trip:view:internal"));

router.get("/", listInquiries);
router.patch("/:id/status", updateInquiryStatus);

export default router;
