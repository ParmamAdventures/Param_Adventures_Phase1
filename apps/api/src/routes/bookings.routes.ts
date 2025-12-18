import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { attachPermissions } from "../middlewares/permission.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";
import { createBooking } from "../controllers/bookings/createBooking.controller";
import { getMyBookings } from "../controllers/bookings/getMyBookings.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  attachPermissions,
  requirePermission("booking:create"),
  createBooking
);

router.get("/me", requireAuth, attachPermissions, getMyBookings);

export default router;
