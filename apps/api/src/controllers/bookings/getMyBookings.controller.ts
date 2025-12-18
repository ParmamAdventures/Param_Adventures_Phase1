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
          durationDays: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    bookings.map((b) => ({
      id: b.id,
      status: b.status,
      notes: b.notes,
      createdAt: b.createdAt,
      trip: b.trip,
    }))
  );
}
