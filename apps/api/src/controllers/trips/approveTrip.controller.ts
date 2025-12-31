import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const approveTrip = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const trip = await prisma.trip.findUnique({ where: { id } });

  if (!trip) return ApiResponse.error(res, "Trip not found", 404);
  if (trip.status !== "PENDING_REVIEW")
    return ApiResponse.error(res, "Invalid state transition", 403);

  const updated = await prisma.trip.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedById: user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "TRIP_APPROVED",
      targetType: "TRIP",
      targetId: updated.id,
      metadata: { status: updated.status },
    },
  });

  return ApiResponse.success(res, "Trip approved successfully", updated);
});
