import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const createTrip = catchAsync(async (req: Request, res: Response) => {
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
      // Expanded fields
      category: req.body.category,
      capacity: req.body.capacity || 0,
      startPoint: req.body.startPoint,
      endPoint: req.body.endPoint,
      altitude: req.body.altitude,
      distance: req.body.distance,
      itineraryPdf: req.body.itineraryPdf,
      highlights: req.body.highlights,
      inclusions: req.body.inclusions,
      exclusions: req.body.exclusions,
      cancellationPolicy: req.body.cancellationPolicy,
      thingsToPack: req.body.thingsToPack,
      faqs: req.body.faqs,
      seasons: req.body.seasons,
      isFeatured: req.body.isFeatured || false,
      startDate: req.body.startDate ? new Date(req.body.startDate) : null,
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      coverImageId: req.body.coverImageId || null,
      heroImageId: req.body.heroImageId || null,
      createdById: user.id,
      gallery:
        req.body.gallery && req.body.gallery.length > 0
          ? {
              create: req.body.gallery.map((g: any, index: number) => ({
                imageId: g.id,
                order: index,
              })),
            }
          : undefined,
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

  return ApiResponse.success(res, trip, "Trip created successfully", 201);
});
