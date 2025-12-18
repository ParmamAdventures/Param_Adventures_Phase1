import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";
import { listTripBookings } from "../../controllers/admin/listTripBookings.controller";

const router = Router();

router.get(
  "/:tripId/bookings",
  requireAuth,
  attachPermissions,
  requirePermission("booking:read:admin"),
  listTripBookings
);

export default router;
