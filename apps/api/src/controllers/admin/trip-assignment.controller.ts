import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { ErrorMessages } from "../../constants/errorMessages";
import { logger } from "../../lib/logger";
import { notificationQueue } from "../../lib/queue";

/**
 * Assign Manager
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function assignManager(req: Request, res: Response) {
  const { tripId } = req.params;
  const { managerId } = req.body;

  if (!managerId) {
    throw new HttpError(400, "INVALID_REQUEST", "managerId is required");
  }

  // Verify trip exists
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.TRIP_NOT_FOUND);
  }

  // Verify manager has the correct role
  const manager = await prisma.user.findUnique({
    where: { id: managerId },
    include: { roles: { include: { role: true } } },
  });

  if (!manager || !manager.roles.some((r) => r.role.name === "TRIP_MANAGER")) {
    throw new HttpError(400, "INVALID_ROLE", "User does not have TRIP_MANAGER role");
  }

  const updatedTrip = await prisma.trip.update({
    where: { id: tripId },
    data: { managerId },
    include: { manager: { select: { id: true, name: true, email: true } } },
  });

  logger.info("Manager assigned to trip", { tripId, managerId });

  // Send Notification (Async - Fire & Forget to prevent hanging if Redis is slow)
  notificationQueue
    .add("SEND_ASSIGNMENT_EMAIL", {
      userId: managerId,
      role: "TRIP_MANAGER",
      details: {
        tripTitle: trip.title,
      },
    })
    .catch((err) => {
      logger.error("Failed to queue assignment email", { error: err });
    });

  res.json({ success: true, trip: updatedTrip });
}

/**
 * Assign Guide
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function assignGuide(req: Request, res: Response) {
  const { tripId } = req.params;
  const { guideId } = req.body;
  const userId = req.user!.id;
  const userRoles = (req as any).roles || [];

  if (!guideId) {
    throw new HttpError(400, "INVALID_REQUEST", "guideId is required");
  }

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.TRIP_NOT_FOUND);
  }

  // Authorization check: Only Admin or the assigned Manager can assign guides
  const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");
  const isAssignedManager = trip.managerId === userId;

  if (!isAdmin && !isAssignedManager) {
    throw new HttpError(403, "FORBIDDEN", "You are not authorized to assign guides to this trip");
  }

  // Verify guide has the correct role
  const guide = await prisma.user.findUnique({
    where: { id: guideId },
    include: { roles: { include: { role: true } } },
  });

  if (!guide || !guide.roles.some((r) => r.role.name === "TRIP_GUIDE")) {
    throw new HttpError(400, "INVALID_ROLE", "User does not have TRIP_GUIDE role");
  }

  // Add to many-to-many relation
  await prisma.tripsOnGuides.upsert({
    where: {
      tripId_guideId: { tripId, guideId },
    },
    update: {},
    create: { tripId, guideId },
  });

  logger.info("Guide assigned to trip", { tripId, guideId, assignedBy: userId });

  // Send Notification (Async)
  await notificationQueue.add("SEND_ASSIGNMENT_EMAIL", {
    userId: guideId,
    role: "TRIP_GUIDE",
    details: {
      tripTitle: trip.title,
    },
  });

  res.json({ success: true, message: "Guide assigned successfully" });
}

/**
 * Remove Guide
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function removeGuide(req: Request, res: Response) {
  const { tripId, guideId } = req.params;
  const userId = req.user!.id;
  const userRoles = (req as any).roles || [];

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.TRIP_NOT_FOUND);
  }

  const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");
  const isAssignedManager = trip.managerId === userId;

  if (!isAdmin && !isAssignedManager) {
    throw new HttpError(403, "FORBIDDEN", "You are not authorized to remove guides from this trip");
  }

  await prisma.tripsOnGuides.delete({
    where: {
      tripId_guideId: { tripId, guideId },
    },
  });

  logger.info("Guide removed from trip", { tripId, guideId, removedBy: userId });
  res.json({ success: true, message: "Guide removed successfully" });
}

/**
 * List Eligible Users
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function listEligibleUsers(req: Request, res: Response) {
  const { role } = req.query; // 'TRIP_MANAGER' or 'TRIP_GUIDE'

  if (!role || typeof role !== "string") {
    throw new HttpError(400, "INVALID_REQUEST", "role query parameter is required");
  }

  const users = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: { name: role },
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      nickname: true,
    },
  });

  res.json(users);
}
