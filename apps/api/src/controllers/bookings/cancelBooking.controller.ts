import { Request, Response } from "express";
import { bookingService } from "../../services/booking.service";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const updatedBooking = await bookingService.cancelBooking(id, userId);

  return ApiResponse.success(res, { booking: updatedBooking }, "Booking cancelled successfully");
});

