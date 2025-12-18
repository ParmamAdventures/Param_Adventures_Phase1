import { Router } from "express";
import { assignRole } from "../../controllers/admin/role-assign.controller";
import { revokeRole } from "../../controllers/admin/role-revoke.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";

const router = Router();

router.post(
  "/assign",
  requireAuth,
  attachPermissions,
  requirePermission("user:assign-role"),
  assignRole
);

router.post(
  "/revoke",
  requireAuth,
  attachPermissions,
  requirePermission("user:remove-role"),
  revokeRole
);

export default router;
