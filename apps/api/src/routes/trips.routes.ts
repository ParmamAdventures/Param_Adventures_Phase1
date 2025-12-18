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
router.get("/public", async (_req, res) => {
  const trips = await prisma.trip.findMany({ where: { status: "PUBLISHED" } });
  res.json(trips);
});

// Internal list
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

export default router;
