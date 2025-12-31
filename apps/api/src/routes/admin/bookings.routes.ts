import { Router } from "express";
import { listAllBookings } from "../../controllers/admin/listAllBookings.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  attachPermissions,
  requirePermission("booking:read:admin"),
  listAllBookings,
);

export default router;
