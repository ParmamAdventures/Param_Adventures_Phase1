import { Router } from "express";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware";
import { attachPermissions } from "../middlewares/permission.middleware";
import { requirePermission } from "../middlewares/require-permission.middleware";
import { requireRole } from "../middlewares/require-role.middleware";

import { createTrip } from "../controllers/trips/createTrip.controller";
import { updateTrip } from "../controllers/trips/updateTrip.controller";
import { deleteTrip } from "../controllers/trips/deleteTrip.controller";
import { submitTrip } from "../controllers/trips/submitTrip.controller";
import { approveTrip } from "../controllers/trips/approveTrip.controller";
import { publishTrip } from "../controllers/trips/publishTrip.controller";
import { archiveTrip } from "../controllers/trips/archiveTrip.controller";
import { getInternalTrips } from "../controllers/trips/internalTrips.controller";
import { getPublicTrips } from "../controllers/trips/getPublicTrips.controller";
import { restoreTrip } from "../controllers/trips/restoreTrip.controller";
import { prisma } from "../lib/prisma";
const router = Router();

import { validate } from "../middlewares/validate.middleware";
import { createTripSchema, updateTripSchema } from "../schemas/trip.schema";
import { getTripBySlug } from "../controllers/trips/getTripBySlug.controller";
import { getTripById } from "../controllers/trips/getTripById.controller";

/**
 * @swagger
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         price:
 *           type: number
 *         durationDays:
 *           type: integer
 *         difficulty:
 *           type: string
 *           enum: [EASY, MODERATE, DIFFICULT, EXTREME]
 *         status:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 */

// ... imports ...

// Public metadata for filters (Must be before /public route)
/**
 * @swagger
 * /trips/public/meta:
 *   get:
 *     summary: Get metadata for trip filtering (min/max price, duration)
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: Metadata returned
 */
router.get("/public/meta", async (req, res) => {
  const aggs = await prisma.trip.aggregate({
    _min: { price: true, durationDays: true },
    _max: { price: true, durationDays: true },
    where: { status: "PUBLISHED" },
  });

  res.json({
    minPrice: aggs._min.price || 0,
    maxPrice: aggs._max.price || 100000,
    minDuration: aggs._min.durationDays || 1,
    maxDuration: aggs._max.durationDays || 30,
  });
});

// Public list with search and filtering
/**
 * @swagger
 * /trips/public:
 *   get:
 *     summary: Get public trips
 *     tags: [Trips]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of published trips
 */
router.get("/public", getPublicTrips);

/**
 * @swagger
 * /trips/public/{slug}:
 *   get:
 *     summary: Get a trip by slug (Public)
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip details
 *       404:
 *         description: Not found
 */
router.get("/public/:slug", optionalAuth, getTripBySlug);

import { getManagerTrips } from "../controllers/trips/getManagerTrips.controller";

// Internal list (also placed before param routes)
/**
 * @swagger
 * /trips/manager:
 *   get:
 *     summary: Get trips managed by current user
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of managed trips
 */
router.get(
  "/manager",
  requireAuth,
  attachPermissions,
  requireRole("TRIP_MANAGER"),
  getManagerTrips,
);

/**
 * @swagger
 * /trips/internal:
 *   get:
 *     summary: Get all trips (Internal/Admin)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all trips
 */
router.get(
  "/internal",
  requireAuth,
  attachPermissions,
  requirePermission("trip:view:internal"),
  getInternalTrips,
);

/**
 * @swagger
 * /trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trip'
 *     responses:
 *       201:
 *         description: Trip created
 */
router.post(
  "/",
  requireAuth,
  attachPermissions,
  requirePermission("trip:create"),
  validate(createTripSchema),
  createTrip,
);
/**
 * @swagger
 * /trips/{id}:
 *   put:
 *     summary: Update an existing trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trip'
 *     responses:
 *       200:
 *         description: Trip updated
 */
router.put(
  "/:id",
  requireAuth,
  attachPermissions,
  requirePermission("trip:edit"),
  validate(updateTripSchema),
  updateTrip,
);

/**
 * @swagger
 * /trips/{id}:
 *   delete:
 *     summary: Delete a trip (Super Admin)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trip deleted
 */
router.delete("/:id", requireAuth, attachPermissions, requirePermission("trip:delete"), deleteTrip);

// Get single trip with owner-or-internal-view logic
router.get("/:id", requireAuth, attachPermissions, getTripById);
router.post(
  "/:id/submit",
  requireAuth,
  attachPermissions,
  requirePermission("trip:submit"),
  submitTrip,
);
router.post(
  "/:id/approve",
  requireAuth,
  attachPermissions,
  requirePermission("trip:approve"),
  approveTrip,
);
router.post(
  "/:id/publish",
  requireAuth,
  attachPermissions,
  requirePermission("trip:publish"),
  publishTrip,
);
router.post(
  "/:id/archive",
  requireAuth,
  attachPermissions,
  requirePermission("trip:archive"),
  archiveTrip,
);

router.post(
  "/:id/restore",
  requireAuth,
  attachPermissions,
  requirePermission("trip:archive"), // Re-using archive permission for restore
  restoreTrip,
);

import { uploadTripDocs } from "../controllers/trips/uploadTripDocs.controller";
import { completeTrip } from "../controllers/trips/completeTrip.controller";

/**
 * @swagger
 * /trips/{id}/docs:
 *   post:
 *     summary: Upload documents for a trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Document uploaded
 */
router.post("/:id/docs", requireAuth, attachPermissions, uploadTripDocs);

/**
 * @swagger
 * /trips/{id}/complete:
 *   post:
 *     summary: Mark a trip as complete
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trip completed
 */
router.post(
  "/:id/complete", // Route for completing the trip
  requireAuth,
  attachPermissions,
  requirePermission("trip:update-status"),
  completeTrip,
);

// Public list

export default router;
