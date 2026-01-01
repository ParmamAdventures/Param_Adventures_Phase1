import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const restoreTrip = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const trip = await prisma.trip.findUnique({ where: { id } });

  if (!trip) return ApiResponse.error(res, "Trip not found", 404);
  if (trip.status !== "ARCHIVED") return ApiResponse.error(res, "Only archived trips can be restored", 400);

  const updated = await prisma.trip.update({
    where: { id },
    data: { status: "DRAFT" },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "TRIP_RESTORED",
      targetType: "TRIP",
      targetId: updated.id,
      metadata: { status: updated.status },
    },
  });

  return ApiResponse.success(res, "Trip restored to Draft", updated);
});
