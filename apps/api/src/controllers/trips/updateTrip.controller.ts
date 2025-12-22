import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function updateTrip(req: Request, res: Response) {
  const user = (req as any).user;
  const { id } = req.params;

  const trip = await prisma.trip.findUnique({ where: { id } });

  if (!trip) return res.status(404).json({ error: "Trip not found" });
  // Check permissions: Owner OR Admin (trip:edit)
  const isOwner = trip.createdById === user.id;
  const canEditAny = user.permissions?.includes("trip:edit");
  
  if (!isOwner && !canEditAny) {
    return res.status(403).json({ error: "Insufficient permissions to edit this trip" });
  }

  // Allow editing even if not DRAFT if user is Admin
  if (trip.status !== "DRAFT" && !canEditAny) {
    return res.status(403).json({ error: "Only drafts can be edited by owners" });
  }

  const updated = await prisma.trip.update({
    where: { id },
    data: {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      itinerary: req.body.itinerary,
      location: req.body.location,
      price: req.body.price,
      durationDays: req.body.durationDays,
      difficulty: req.body.difficulty,
      isFeatured: req.body.isFeatured,
      startDate: req.body.startDate ? new Date(req.body.startDate) : null,
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      coverImageId: req.body.coverImageId,
      // Update gallery
      gallery: req.body.gallery ? {
        deleteMany: {},
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
            orderBy: { order: "asc" }
        }
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "TRIP_UPDATED",
      targetType: "TRIP",
      targetId: updated.id,
      metadata: { status: updated.status },
    },
  });

  res.json(updated);
}
