import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const getManagerTrips = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    // Optional status filter
    const { status } = req.query;
    const where: any = {
      managerId: userId,
    };

    if (status) {
      where.status = status;
    }

    const trips = await prisma.trip.findMany({
      where,
      orderBy: { startDate: "asc" },
      include: {
        coverImage: true,
        guides: {
            include: {
                guide: { select: { id: true, name: true, email: true, avatarImage: true } }
            }
        },
        _count: {
          select: { bookings: true }
        }
      },
    });

    res.json(trips);
  } catch (error) {
    console.error("Error fetching manager trips:", error);
    res.status(500).json({ error: "Failed to fetch manager trips" });
  }
};
