import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

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
      isFeatured: req.body.isFeatured || false,
      startDate: req.body.startDate ? new Date(req.body.startDate) : null,
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      coverImageId: req.body.coverImageId || null,
      createdById: user.id,
      gallery: req.body.gallery && req.body.gallery.length > 0 ? {
        create: req.body.gallery.map((g: any, index: number) => ({
          imageId: g.id,
          order: index,
        })),
      } : undefined,
    },
    include: {
      coverImage: true,
      gallery: {
        include: { image: true },
        orderBy: { order: "asc" },
      },
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
