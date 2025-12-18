import { Router } from "express";
import { listUsers } from "../../controllers/admin/users.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  attachPermissions,
  requirePermission("user:list"),
  listUsers
);

export default router;
