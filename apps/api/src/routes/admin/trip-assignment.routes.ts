import { Router } from "express";
import {
  assignManager,
  assignGuide,
  removeGuide,
  listEligibleUsers,
} from "../../controllers/admin/trip-assignment.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { attachPermissions } from "../../middlewares/permission.middleware";
import { requirePermission } from "../../middlewares/require-permission.middleware";

const router = Router();

router.use(requireAuth);
router.use(attachPermissions);

// List users eligible for roles (Admin or Manager)
router.get("/eligible-users", requirePermission("trip:assign-guide"), listEligibleUsers);

// Admin only: Assign Manager
router.post("/:tripId/manager", requirePermission("trip:edit"), assignManager);

// Admin or Manager: Assign/Remove Guide
router.post("/:tripId/guide", requirePermission("trip:assign-guide"), assignGuide);
router.delete("/:tripId/guide/:guideId", requirePermission("trip:assign-guide"), removeGuide);

export default router;
