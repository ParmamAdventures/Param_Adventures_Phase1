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
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// Public list (must be defined before param routes so '/public' doesn't match '/:id')
router.get("/public", async (_req, res) => {
  const trips = await prisma.trip.findMany({ where: { status: "PUBLISHED" } });
  res.json(trips);
});

// Internal list (also placed before param routes)
router.get(
  "/internal",
  requireAuth,
  attachPermissions,
  requirePermission("trip:view:internal"),
  async (_req, res) => {
    const trips = await prisma.trip.findMany();
    res.json(trips);
  }
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
  const user = (req as any).user;
  const permissions = (req as any).permissions || [];

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
