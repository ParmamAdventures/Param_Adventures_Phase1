import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { logger } from "../../lib/logger";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { getTripOrThrowError } from "../../utils/entityHelpers";
import { ErrorMessages } from "../../constants/errorMessages";

export const completeTrip = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const trip = await getTripOrThrowError(id);

  // Authz: Only Manager or Admin (Guides cannot close trips, only submit docs)
  const isManager = trip.managerId === userId;
  const isAdmin = req.user?.roles.includes("ADMIN") || req.user?.roles.includes("SUPER_ADMIN");

  if (!isManager && !isAdmin) {
    throw new HttpError(403, "FORBIDDEN", "Only the Manager can mark the trip as complete");
  }

  const updatedTrip = await prisma.$transaction(async (tx) => {
    // 1. Update Trip
    const t = await tx.trip.update({
      where: { id },
      data: {
        status: "COMPLETED",
        endDate: new Date(),
      },
    });

    // 2. Cascade to Bookings (Mark all CONFIRMED bookings as COMPLETED)
    const updatedBookings = await tx.booking.updateMany({
      where: {
        tripId: id,
        status: "CONFIRMED",
      },
      data: {
        status: "COMPLETED",
      },
    });

    logger.info(`Trip ${id} completed. Updated ${updatedBookings.count} bookings to COMPLETED.`);

    return t;
  });

  logger.info("Trip Completed", { tripId: id, closedBy: userId });

  // TODO: Trigger Badge Awards / Review Requests here

  return ApiResponse.success(res, { trip: updatedTrip }, "Trip completed successfully");
});
