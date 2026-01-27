import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { TripCacheService } from "../../services/trip-cache.service";
import { getTripOrThrow } from "../../utils/entityHelpers";
import { auditService, AuditActions, AuditTargetTypes } from "../../services/audit.service";
import { ErrorCodes, ErrorMessages } from "../../constants/errorMessages";
import { TripIncludes } from "../../constants/prismaIncludes";

export const updateTrip = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const trip = await getTripOrThrow(id, res);
  if (!trip) return;

  // Check permissions: Owner OR Admin (trip:edit)
  const isOwner = trip.createdById === user.id;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const canEditAny = (user as any).permissions?.includes("trip:edit");

  if (!isOwner && !canEditAny) {
    return ApiResponse.error(
      res,
      ErrorCodes.TRIP_EDIT_FORBIDDEN,
      ErrorMessages.INSUFFICIENT_PERMISSIONS,
      403,
    );
  }

  // Allow editing even if not DRAFT if user is Admin
  if (trip.status !== "DRAFT" && !canEditAny) {
    return ApiResponse.error(
      res,
      ErrorCodes.TRIP_EDIT_NOT_DRAFT,
      ErrorMessages.TRIP_EDIT_NOT_DRAFT,
      403,
    );
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
      // Expanded fields
      category: req.body.category,
      capacity: req.body.capacity,
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
      durationDays: req.body.durationDays,
      difficulty: req.body.difficulty,
      isFeatured: req.body.isFeatured,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      coverImageId: req.body.coverImageId,
      heroImageId: req.body.heroImageId,
      // Update gallery
      gallery: req.body.gallery
        ? {
            deleteMany: {},
            create: req.body.gallery.map((g: Record<string, string>, index: number) => ({
              imageId: g.id,
              order: index,
            })),
          }
        : undefined,
    },
    include: TripIncludes.withMedia,
  });

  // Invalidate cache after update
  await TripCacheService.invalidateTrip(updated);

  await auditService.logAudit({
    actorId: user.id,
    action: AuditActions.TRIP_UPDATED,
    targetType: AuditTargetTypes.TRIP,
    targetId: updated.id,
    metadata: { status: updated.status },
  });

  return ApiResponse.success(res, updated, "Trip updated successfully");
});
