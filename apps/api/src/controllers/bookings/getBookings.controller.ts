import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const getBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        trip: {
          select: {
            title: true,
            slug: true,
            location: true,
            coverImageLegacy: true,
            coverImage: {
              select: {
                mediumUrl: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};
