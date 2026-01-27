import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { getTripOrThrow } from "../../utils/entityHelpers";
import { validateTripStatusTransition } from "../../utils/statusValidation";
import { ErrorCodes } from "../../constants/errorMessages";
import { tripService } from "../../services/trip.service";
import { EntityStatus } from "../../constants/status";

export const approveTrip = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const trip = await getTripOrThrow(id, res);
  if (!trip) return;

  // Validate status transition
  try {
    validateTripStatusTransition(trip.status, EntityStatus.APPROVED);
  } catch (error: unknown) {
    const err = error as Error;
    return ApiResponse.error(res, ErrorCodes.INVALID_STATUS_TRANSITION, err.message, 400);
  }

  const updated = await tripService.approveTrip(id, user.id);

  return ApiResponse.success(res, updated, "Trip approved successfully");
});
