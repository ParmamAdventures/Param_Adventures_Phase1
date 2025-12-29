import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        trip: {
          select: {
            title: true,
            slug: true,
            price: true,
            location: true,
            coverImage: { select: { mediumUrl: true } }
          }
        },
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Get Booking Error:", error);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
};
