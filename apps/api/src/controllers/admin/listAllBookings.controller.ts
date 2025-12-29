import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function listAllBookings(req: Request, res: Response) {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      trip: {
        select: {
          id: true,
          title: true,
          slug: true,
          location: true,
          price: true,
          startDate: true,
        },
      },
      payments: {
        select: {
          id: true,
          status: true,
          amount: true,
          providerOrderId: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return res.json(bookings);
}
