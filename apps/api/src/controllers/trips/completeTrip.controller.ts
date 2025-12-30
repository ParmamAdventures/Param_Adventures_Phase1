import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { logger } from "../../lib/logger";

export const completeTrip = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) {
    throw new HttpError(404, "NOT_FOUND", "Trip not found");
  }

  // Authz: Only Manager or Admin (Guides cannot close trips, only submit docs)
  const isManager = trip.managerId === userId;
  const isAdmin = req.user?.roles.includes("ADMIN") || req.user?.roles.includes("SUPER_ADMIN");

  if (!isManager && !isAdmin) {
      throw new HttpError(403, "FORBIDDEN", "Only the Manager can mark the trip as complete");
  }

  const updatedTrip = await prisma.trip.update({
      where: { id },
      data: { 
          status: "COMPLETED",
          endDate: new Date() // Or keep original? Usually actual end date is now.
      }
  });

  logger.info("Trip Completed", { tripId: id, closedBy: userId });

  // TODO: Trigger Badge Awards / Review Requests here

  res.json({ success: true, trip: updatedTrip });
};
