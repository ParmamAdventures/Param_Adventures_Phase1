import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { attachPermissions } from "../middlewares/permission.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";
import { getBookings } from "../controllers/bookings/getBookings.controller";
import { getBookingById } from "../controllers/bookings/getBookingById.controller";
import { cancelBooking } from "../controllers/bookings/cancelBooking.controller";
import { createBooking } from "../controllers/bookings/createBooking.controller";

const router = Router();

// Create a new booking
router.post("/", requireAuth, createBooking);

// Get user's bookings
router.get("/my-bookings", requireAuth, getBookings);

// Get single booking details
router.get("/:id", requireAuth, getBookingById);


// Cancel booking
router.post("/:id/cancel", requireAuth, cancelBooking);

// Refund booking (Super Admin Only)
import { refundBooking } from "../controllers/payments/refundBooking.controller";
import { requireRole } from "../middlewares/require-role.middleware";
router.post("/:id/refund", requireAuth, requireRole("super_admin"), refundBooking);

export default router;
