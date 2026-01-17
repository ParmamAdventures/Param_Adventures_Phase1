import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

/**
 * Get Guide Trips
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getGuideTrips(req: Request, res: Response) {
  const userId = (req as any).user.id;

  try {
    const assignments = await prisma.tripsOnGuides.findMany({
      where: { guideId: userId },
      include: {
        trip: {
          include: {
            coverImage: true,
            bookings: {
              where: { status: "CONFIRMED" },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    phoneNumber: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { trip: { startDate: "asc" } },
    });

    const trips = assignments.map((a) => ({
      ...a.trip,
      assignedAt: a.assignedAt,
    }));

    res.json(trips);
  } catch (error) {
    console.error("Failed to fetch guide trips", error);
    res.status(500).json({ error: "Failed to fetch guide trips" });
  }
}
