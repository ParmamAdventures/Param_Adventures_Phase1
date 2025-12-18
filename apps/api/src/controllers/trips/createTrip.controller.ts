import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createTrip(req: Request, res: Response) {
  const user = (req as any).user;

  const trip = await prisma.trip.create({
    data: {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      itinerary: req.body.itinerary,
      durationDays: req.body.durationDays,
      difficulty: req.body.difficulty,
      location: req.body.location,
      price: req.body.price,
      createdById: user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "TRIP_CREATED",
      targetType: "TRIP",
      targetId: trip.id,
      metadata: { status: trip.status },
    },
  });

  res.status(201).json(trip);
}
