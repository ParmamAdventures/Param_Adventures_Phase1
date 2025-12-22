import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { attachPermissions } from "../middlewares/permission.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";

import { createTrip } from "../controllers/trips/createTrip.controller";
import { updateTrip } from "../controllers/trips/updateTrip.controller";
import { submitTrip } from "../controllers/trips/submitTrip.controller";
import { approveTrip } from "../controllers/trips/approveTrip.controller";
import { publishTrip } from "../controllers/trips/publishTrip.controller";
import { archiveTrip } from "../controllers/trips/archiveTrip.controller";
import { getInternalTrips } from "../controllers/trips/internalTrips.controller";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

import { getTripBySlug } from "../controllers/trips/getTripBySlug.controller";

// ... imports ...

// Public list with search and filtering
router.get("/public", async (req, res) => {
  const { search, category, difficulty, maxPrice } = req.query;
  
  const where: any = { status: "PUBLISHED" };
  
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: "insensitive" } },
      { description: { contains: String(search), mode: "insensitive" } },
    ];
  }
  
  if (category) {
    where.category = category;
  }
  
  if (difficulty) {
    where.difficulty = difficulty;
  }
  
  if (maxPrice) {
    where.price = { lte: Number(maxPrice) };
  }

  if (Boolean(req.query.isFeatured) === true) {
     where.isFeatured = true;
  }

  const trips = await prisma.trip.findMany({ 
    where,
    orderBy: { createdAt: "desc" },
    include: {
      coverImage: true,
    }
  });
  res.json(trips);
});

router.get("/public/:slug", getTripBySlug);

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

  const trip = await prisma.trip.findUnique({ where: { id } });
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
