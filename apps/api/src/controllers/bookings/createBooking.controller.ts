import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { tripId, startDate, guests } = req.body;
    const userId = req.user!.id; // Assumes requireAuth middleware

    if (!tripId || !startDate || !guests) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.status !== "PUBLISHED") {
      return res.status(400).json({ error: "Trip is not available for booking" });
    }

    const totalPrice = trip.price * guests;

    const booking = await prisma.booking.create({
      data: {
        userId,
        tripId,
        startDate: new Date(startDate),
        guests: Number(guests),
        totalPrice,
        status: "REQUESTED",
        paymentStatus: "PENDING",
      },
      include: {
        trip: {
          select: {
            title: true,
            slug: true,
          }
        }
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};
