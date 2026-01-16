import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { getBookings } from "../controllers/bookings/getBookings.controller";
import { getBookingById } from "../controllers/bookings/getBookingById.controller";
import { cancelBooking } from "../controllers/bookings/cancelBooking.controller";
import { createBooking } from "../controllers/bookings/createBooking.controller";
import { initiatePayment } from "../controllers/payments/initiatePayment.controller";
import { verifyPayment } from "../controllers/payments/verifyPayment.controller";
import { getPaymentStatus } from "../controllers/payments/getPaymentStatus.controller";
import { getPaymentHistory } from "../controllers/payments/getPaymentHistory.controller";
import { downloadInvoice } from "../controllers/bookings/downloadInvoice.controller";

const router = Router();

// Create a new booking
router.post("/", requireAuth, createBooking);

// Get User's Payment History (Must be before /:id)
router.get("/payments/history", requireAuth, getPaymentHistory);

// Get user's bookings
router.get("/me", requireAuth, getBookings);

// Get single booking details
router.get("/:id", requireAuth, getBookingById);
// Cancel booking
router.post("/:id/cancel", requireAuth, cancelBooking);

// Initiate Payment
router.post("/:id/initiate-payment", requireAuth, initiatePayment);
// Verify Payment
router.post("/:id/verify-payment", requireAuth, verifyPayment);
// Get Payment Status for a booking
router.get("/:id/payment-status", requireAuth, getPaymentStatus);
// Download Invoice
router.get("/:id/invoice", requireAuth, downloadInvoice);

// Refund booking (Super Admin Only)
import { refundBooking } from "../controllers/payments/refundBooking.controller";
import { requireRole } from "../middlewares/require-role.middleware";
router.post("/:id/refund", requireAuth, requireRole("super_admin"), refundBooking);

export default router;
