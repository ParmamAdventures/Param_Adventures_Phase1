import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const submitTrip = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const trip = await prisma.trip.findUnique({ where: { id } });

  if (!trip) return ApiResponse.error(res, "TRIP_NOT_FOUND", "Trip not found", 404);
  if (trip.createdById !== user.id)
    return ApiResponse.error(res, "TRIP_SUBMIT_FORBIDDEN", "Not owner", 403);
  if (trip.status !== "DRAFT")
    return ApiResponse.error(res, "TRIP_SUBMIT_INVALID_STATE", "Invalid state transition", 403);

  const updated = await prisma.trip.update({
    where: { id },
    data: { status: "PENDING_REVIEW" },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "TRIP_SUBMITTED",
      targetType: "TRIP",
      targetId: updated.id,
      metadata: { status: updated.status },
    },
  });

  return ApiResponse.success(res, updated, "Trip submitted successfully");
});
