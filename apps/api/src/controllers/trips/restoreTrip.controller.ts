import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { getTripOrThrow } from "../../utils/entityHelpers";
import { validateTripStatusTransition } from "../../utils/statusValidation";
import { auditService, AuditActions, AuditTargetTypes } from "../../services/audit.service";
import { ErrorCodes, ErrorMessages } from "../../constants/errorMessages";

export const restoreTrip = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const trip = await getTripOrThrow(id, res);
  if (!trip) return;

  // Validate status transition
  try {
    validateTripStatusTransition(trip.status, "DRAFT");
  } catch (error: any) {
    return ApiResponse.error(res, ErrorCodes.INVALID_STATUS_TRANSITION, error.message, 400);
  }

  const updated = await prisma.trip.update({
    where: { id },
    data: { status: "DRAFT" },
  });

  await auditService.logAudit({
    actorId: user.id,
    action: AuditActions.TRIP_RESTORED,
    targetType: AuditTargetTypes.TRIP,
    targetId: updated.id,
    metadata: { status: updated.status },
  });

  return ApiResponse.success(res, updated, "Trip restored to Draft");
});
