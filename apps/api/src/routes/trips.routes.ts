import { Router } from "express";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware";
import { attachPermissions } from "../middlewares/permission.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";

import { createTrip } from "../controllers/trips/createTrip.controller";
import { updateTrip } from "../controllers/trips/updateTrip.controller";
import { submitTrip } from "../controllers/trips/submitTrip.controller";
import { approveTrip } from "../controllers/trips/approveTrip.controller";
import { publishTrip } from "../controllers/trips/publishTrip.controller";
import { archiveTrip } from "../controllers/trips/archiveTrip.controller";
import { getInternalTrips } from "../controllers/trips/internalTrips.controller";
import { getPublicTrips } from "../controllers/trips/getPublicTrips.controller";
import { prisma } from "../lib/prisma";
const router = Router();

import { getTripBySlug } from "../controllers/trips/getTripBySlug.controller";

// ... imports ...

// Public metadata for filters (Must be before /public route)
router.get("/public/meta", async (req, res) => {
  const aggs = await prisma.trip.aggregate({
    _min: { price: true, durationDays: true },
    _max: { price: true, durationDays: true },
    where: { status: "PUBLISHED" }
  });
  
  res.json({
    minPrice: aggs._min.price || 0,
    maxPrice: aggs._max.price || 100000,
    minDuration: aggs._min.durationDays || 1,
    maxDuration: aggs._max.durationDays || 30
  });
});

// Public list with search and filtering
router.get("/public", getPublicTrips);

router.get("/public/:slug", optionalAuth, getTripBySlug);

// Internal list (also placed before param routes)
router.get(
  "/internal",
  requireAuth,
  attachPermissions,
  requirePermission("trip:view:internal"),
  getInternalTrips
);

router.post(
  "/",
  requireAuth,
  attachPermissions,
  requirePermission("trip:create"),
  createTrip
);
router.put(
  "/:id",
  requireAuth,
  attachPermissions,
  requirePermission("trip:edit"),
  updateTrip
);

// Get single trip with owner-or-internal-view logic
router.get("/:id", requireAuth, attachPermissions, async (req, res) => {
  const { id } = req.params;
  const user = req.user!;
  const permissions = req.permissions || [];

  const trip = await prisma.trip.findUnique({ 
    where: { id },
    include: {
      manager: { select: { id: true, name: true, email: true } },
      guides: { include: { guide: { select: { id: true, name: true, email: true } } } },
      coverImage: true,
      gallery: { include: { image: true }, orderBy: { order: "asc" } }
    }
  });

  if (!trip) return res.status(404).json({ error: "Trip not found" });

  if (
    permissions.includes("trip:view:internal") ||
    trip.createdById === user.id
  ) {
    return res.json(trip);
  }

  return res.status(403).json({ error: "Insufficient permissions" });
});
router.post(
  "/:id/submit",
  requireAuth,
  attachPermissions,
  requirePermission("trip:submit"),
  submitTrip
);
router.post(
  "/:id/approve",
  requireAuth,
  attachPermissions,
  requirePermission("trip:approve"),
  approveTrip
);
router.post(
  "/:id/publish",
  requireAuth,
  attachPermissions,
  requirePermission("trip:publish"),
  publishTrip
);
router.post(
  "/:id/archive",
  requireAuth,
  attachPermissions,
  requirePermission("trip:archive"),
  archiveTrip
);

// Public list

export default router;
