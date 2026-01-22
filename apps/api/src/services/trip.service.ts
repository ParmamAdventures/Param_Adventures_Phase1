import { prisma } from "../lib/prisma";
import { logAudit, AuditAction } from "../utils/audit.helper";
import { EntityStatus } from "../constants/status";

export class TripService {
  /**
   * Creates a new trip and logs the action.
   * @param data The trip data.
   * @param userId The ID of the user creating the trip.
   * @returns The created trip object.
   */
  async createTrip(data: any, userId: string) {
    const trip = await prisma.trip.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdById: userId,
        gallery:
          data.gallery && data.gallery.length > 0
            ? {
                create: data.gallery.map((g: any, index: number) => ({
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

    await logAudit({ id: userId }, AuditAction.TRIP_CREATED, "TRIP", trip.id, {
      status: trip.status,
    });

    return trip;
  }

  /**
   * Fetches a trip by its slug with relations.
   * @param slug The trip slug.
   * @returns The trip object or null if not found.
   */
  async getTripBySlug(slug: string) {
    return prisma.trip.findUnique({
      where: { slug },
      include: {
        coverImage: true,
        heroImage: true,
        gallery: {
          include: {
            image: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  /**
   * Logic for updating an existing trip (to be implemented).
   */
  async updateTrip(id: string, data: any, userId: string) {
    // Basic implementation for now, mirroring createTrip logic
    const trip = await prisma.trip.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        gallery: data.gallery
          ? {
              deleteMany: {},
              create: data.gallery.map((g: any, index: number) => ({
                imageId: g.id,
                order: index,
              })),
            }
          : undefined,
      },
    });

    await logAudit({ id: userId }, AuditAction.TRIP_UPDATED, "TRIP", trip.id);

    return trip;
  }

  async approveTrip(id: string, userId: string) {
    // We need to fetch current status for validation
    // Ideally this check should be reusable, but for now implementing direct logic
    // Using import inside method or assume helpers available if imported at top
    // For simplicity, we trust the caller (controller) did existence check or we do it here.
    // The previous controller did getTripOrThrow. Service should probably throw if not found.
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new Error("Trip not found");

    // We can move validation here or keep in controller.
    // Ideally service handles business logic.
    // Importing validateTripStatusTransition might be circular if it depends on service? No.
    // Let's assume input is valid or validation happens here.

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        status: EntityStatus.APPROVED,
        approvedById: userId,
      },
    });

    await logAudit({ id: userId }, AuditAction.TRIP_APPROVED, "TRIP", updated.id, {
      status: updated.status,
    });
    return updated;
  }

  async publishTrip(id: string, userId: string) {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new Error("Trip not found");

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        status: EntityStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    await logAudit({ id: userId }, AuditAction.TRIP_PUBLISHED, "TRIP", updated.id, {
      status: updated.status,
    });
    return updated;
  }

  async rejectTrip(id: string, userId: string, reason?: string) {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new Error("Trip not found");

    // Rejecting a trip sends it back to DRAFT status for revision
    const updated = await prisma.trip.update({
      where: { id },
      data: {
        status: EntityStatus.DRAFT,
      },
    });

    await logAudit({ id: userId }, AuditAction.TRIP_UPDATED, "TRIP", updated.id, {
      action: "rejected",
      previousStatus: trip.status,
      newStatus: updated.status,
      reason,
    });
    return updated;
  }
}

export const tripService = new TripService();
