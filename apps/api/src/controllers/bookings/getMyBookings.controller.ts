import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { bookingService } from "../../services/booking.service";

/**
 * Get My Bookings
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getMyBookings(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const bookings = await bookingService.getMyBookings(userId);
    return ApiResponse.success(res, bookings, "Bookings retrieved successfully");
  } catch {
    return ApiResponse.error(res, "INTERNAL_SERVER_ERROR", "Failed to load bookings", 500);
  }
}
