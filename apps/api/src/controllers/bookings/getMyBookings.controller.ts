import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getMyBookings(req: Request, res: Response) {
  const user = (req as any).user;

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      trip: {
        select: {
          id: true,
          title: true,
          slug: true,
          location: true,
          coverImage: true,
          publishedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const payload = bookings.map((b) => ({
    id: b.id,
    status: b.status,
    createdAt: b.createdAt,
    trip: {
      id: b.trip.id,
      title: b.trip.title,
      slug: b.trip.slug,
      location: b.trip.location,
      startDate: null,
      endDate: null,
    },
  }));

  return res.json(payload);
}
