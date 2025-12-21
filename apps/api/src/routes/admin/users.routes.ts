import { Router } from "express";
import { listUsers } from "../../controllers/admin/users.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";
import { autoLog } from "../../middlewares/audit.middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  attachPermissions,
  requirePermission("user:list"),
  autoLog({ action: "USER_LIST_VIEW", targetType: "User" }),
  listUsers
);

export default router;
