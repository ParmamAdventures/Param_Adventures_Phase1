import { Router } from "express";
import {
  listUsers,
  updateUserStatus,
  deleteUser,
  unsuspendUser,
} from "../../controllers/admin/users.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";
import { autoLog } from "../../middlewares/audit.middleware";
import { AuditActions } from "../../utils/auditLog";

const router = Router();

router.get(
  "/",
  requireAuth,
  attachPermissions,
  requirePermission("user:list"),
  autoLog({ action: AuditActions.USER_LIST_VIEW, targetType: "User" }),
  listUsers,
);

router.patch(
  "/:id/status",
  requireAuth,
  attachPermissions,
  requirePermission("user:edit"),
  autoLog({ action: AuditActions.USER_STATUS_CHANGED, targetType: "User" }),
  updateUserStatus,
);

router.delete("/:id", requireAuth, attachPermissions, requirePermission("user:delete"), deleteUser);

router.patch(
  "/:id/unsuspend",
  requireAuth,
  attachPermissions,
  requirePermission("user:edit"),
  unsuspendUser,
);

export default router;
