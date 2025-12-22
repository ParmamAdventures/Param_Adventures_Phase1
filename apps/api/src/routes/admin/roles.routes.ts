import { Router } from "express";
import { listRoles, updateRolePermissions } from "../../controllers/admin/roles.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  attachPermissions,
  requirePermission("role:list"),
  listRoles
);

router.patch(
  "/:id/permissions",
  requireAuth,
  attachPermissions,
  requirePermission("role:assign"),
  updateRolePermissions
);

export default router;
