import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { attachPermissions } from "../middlewares/permission.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";
import { createBooking } from "../controllers/bookings/createBooking.controller";
import { getMyBookings } from "../controllers/bookings/getMyBookings.controller";
import { approveBooking } from "../controllers/bookings/approveBooking.controller";
import { rejectBooking } from "../controllers/bookings/rejectBooking.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  attachPermissions,
  requirePermission("booking:create"),
  createBooking
);

router.get("/me", requireAuth, attachPermissions, getMyBookings);

router.post(
  "/:id/approve",
  requireAuth,
  attachPermissions,
  requirePermission("booking:approve"),
  approveBooking
);

router.post(
  "/:id/reject",
  requireAuth,
  attachPermissions,
  requirePermission("booking:reject"),
  rejectBooking
);

export default router;
