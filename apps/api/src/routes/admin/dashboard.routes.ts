import { Router } from "express";
import { getDashboardStats } from "../../controllers/admin/dashboard.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";

const router = Router();

router.use(requireAuth);
router.use(attachPermissions);
router.use(requirePermission("admin:dashboard"));

router.get("/stats", getDashboardStats);

export default router;
