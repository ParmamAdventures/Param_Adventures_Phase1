import { Request, Response } from "express";
import { bookingService } from "../../services/booking.service";

export async function getMyBookings(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const bookings = await bookingService.getMyBookings(userId);
    res.json(bookings);
  } catch {
    res.status(500).json({ error: "Failed to load bookings" });
  }
}
