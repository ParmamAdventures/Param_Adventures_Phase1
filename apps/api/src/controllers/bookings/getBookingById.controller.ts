import { Request, Response } from "express";
import { bookingService } from "../../services/booking.service";

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await bookingService.getBookingById(id, userId);
    res.json(booking);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message.includes("not found")
      ? 404
      : message.includes("Unauthorized")
        ? 403
        : 500;
    res.status(status).json({ error: message });
  }
};
