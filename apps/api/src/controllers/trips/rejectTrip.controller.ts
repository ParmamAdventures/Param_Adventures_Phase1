import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { getTripOrThrow } from "../../utils/entityHelpers";
import { validateTripStatusTransition } from "../../utils/statusValidation";
import { auditService, AuditActions, AuditTargetTypes } from "../../services/audit.service";
import { ErrorCodes, ErrorMessages } from "../../constants/errorMessages";
import { tripService } from "../../services/trip.service";
import { EntityStatus } from "../../constants/status";

export const rejectTrip = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { reason } = req.body;

  const trip = await getTripOrThrow(id, res);
  if (!trip) return;

  // Only PENDING_REVIEW trips can be rejected (sent back to DRAFT)
  if (trip.status !== "PENDING_REVIEW") {
    return ApiResponse.error(
      res,
      ErrorCodes.INVALID_STATUS_TRANSITION,
      "Only trips in PENDING_REVIEW status can be rejected",
      400,
    );
  }

  const updated = await tripService.rejectTrip(id, user.id, reason);

  return ApiResponse.success(res, updated, "Trip rejected successfully");
});
