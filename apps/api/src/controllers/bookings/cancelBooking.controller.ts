import { Request, Response } from "express";
import { bookingService } from "../../services/booking.service";

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const updatedBooking = await bookingService.cancelBooking(id, userId);

    res.json({ message: "Booking cancelled successfully", booking: updatedBooking });
  } catch (error: any) {
    let status = 500;
    if (error.message.includes("not found")) status = 404;
    if (error.message.includes("Unauthorized")) status = 403;
    if (error.message.includes("state")) status = 400;

    res.status(status).json({ error: error.message });
  }
};
