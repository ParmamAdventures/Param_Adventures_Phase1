import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (["CANCELLED", "COMPLETED", "REJECTED"].includes(booking.status)) {
        return res.status(400).json({ error: "Booking cannot be cancelled in its current state" });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    res.json({ message: "Booking cancelled successfully", booking: updatedBooking });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};
