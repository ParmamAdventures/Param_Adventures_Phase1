import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { getTripOrThrow } from "../../utils/entityHelpers";
import { validateTripStatusTransition } from "../../utils/statusValidation";
import { createAuditLog, AuditActions, AuditTargetTypes } from "../../utils/auditLog";
import { ErrorCodes, ErrorMessages } from "../../constants/errorMessages";

export const archiveTrip = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const trip = await getTripOrThrow(id, res);
  if (!trip) return;

  // Validate status transition
  try {
    validateTripStatusTransition(trip.status, "ARCHIVED");
  } catch (error: any) {
    return ApiResponse.error(
      res,
      ErrorCodes.INVALID_STATUS_TRANSITION,
      error.message,
      400
    );
  }

  const updated = await prisma.trip.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  await createAuditLog({
    actorId: user.id,
    action: AuditActions.TRIP_ARCHIVED,
    targetType: AuditTargetTypes.TRIP,
    targetId: updated.id,
    metadata: { status: updated.status },
  });

  return ApiResponse.success(res, updated, "Trip archived successfully");
});
