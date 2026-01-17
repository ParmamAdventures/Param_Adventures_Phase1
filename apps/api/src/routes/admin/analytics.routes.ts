import { Router } from "express";
import {
  getRevenueSummary,
  getTripPerformance,
  getBookingStats,
  getPaymentStats,
  getModerationSummary,
} from "../../controllers/admin/analytics.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";

const router = Router();

router.use(requireAuth);
router.use(attachPermissions);
router.use(requirePermission("analytics:view"));

router.get("/revenue", getRevenueSummary);
router.get("/trips", getTripPerformance);
router.get("/bookings", getBookingStats);
router.get("/payments", getPaymentStats);
router.get("/moderation-summary", getModerationSummary);
router.get("/moderation", getModerationSummary); // alias for tests/routes expecting /moderation

export default router;
