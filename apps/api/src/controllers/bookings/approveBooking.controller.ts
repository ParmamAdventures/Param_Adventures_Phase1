import { Request, Response } from "express";
import { bookingService } from "../../services/booking.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { catchAsync } from "../../utils/catchAsync";

/**
 * Approve Booking
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const approveBooking = catchAsync(async (req: Request, res: Response) => {
  const admin = req.user!;
  const { id } = req.params;

  const updated = await bookingService.approveBooking(id, admin.id);

  return ApiResponse.success(res, updated, "Booking approved successfully");
});
