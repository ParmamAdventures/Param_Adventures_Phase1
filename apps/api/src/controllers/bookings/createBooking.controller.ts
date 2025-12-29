import { Request, Response } from "express";
import { bookingService } from "../../services/booking.service";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { tripId, startDate, guests } = req.body;
    const userId = req.user!.id;

    if (!tripId || !startDate || !guests) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const booking = await bookingService.createBooking({
        userId,
        tripId,
        startDate,
        guests: Number(guests)
    });

    res.status(201).json(booking);
  } catch (error: any) {
    const status = error.message.includes("not found") ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};
