import { Request, Response } from "express";
import { bookingService } from "../../services/booking.service";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const { tripId, startDate, guests, guestDetails } = req.body;
  const userId = req.user!.id;

  if (!tripId || !startDate || !guests) {
    return ApiResponse.error(res, "BOOKING_MISSING_FIELDS", "Missing required fields", 400);
  }

  const booking = await bookingService.createBooking({
    userId,
    tripId,
    startDate,
    guests: Number(guests),
    guestDetails,
  });

  return ApiResponse.success(res, booking, "Booking created successfully", 201);
});
