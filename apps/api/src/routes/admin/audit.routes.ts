import { Router } from "express";
import { listAuditLogs } from "../../controllers/admin/audit.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";

const router = Router();

router.use(requireAuth);
router.use(attachPermissions);
router.use(requirePermission("audit:view"));

router.get("/", listAuditLogs);

export default router;
