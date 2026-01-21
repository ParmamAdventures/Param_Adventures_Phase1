import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { getTripOrThrow } from "../../utils/entityHelpers";
import { validateTripStatusTransition } from "../../utils/statusValidation";
import { auditService, AuditActions, AuditTargetTypes } from "../../services/audit.service";
import { ErrorCodes, ErrorMessages } from "../../constants/errorMessages";

export const submitTrip = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  // Use new utility for fetch and validation
  const trip = await getTripOrThrow(id, res);
  if (!trip) return; // Already sent 404 response

  // Check ownership
  if (trip.createdById !== user.id) {
    return ApiResponse.error(res, ErrorCodes.FORBIDDEN, ErrorMessages.PERMISSION_DENIED, 403);
  }

  // Validate status transition using state machine
  try {
    validateTripStatusTransition(trip.status, "PENDING_REVIEW");
  } catch (error: any) {
    return ApiResponse.error(res, ErrorCodes.INVALID_STATUS_TRANSITION, error.message, 400);
  }

  const updated = await prisma.trip.update({
    where: { id },
    data: { status: "PENDING_REVIEW" },
  });

  // Use new utility for audit log
  await auditService.logAudit({
    actorId: user.id,
    action: AuditActions.TRIP_SUBMITTED,
    targetType: AuditTargetTypes.TRIP,
    targetId: updated.id,
    metadata: { status: updated.status },
  });

  return ApiResponse.success(res, updated, "Trip submitted successfully");
});
