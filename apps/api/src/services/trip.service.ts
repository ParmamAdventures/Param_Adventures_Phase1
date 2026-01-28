import { Prisma } from "@prisma/client";
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
  async createTrip(data: Record<string, unknown>, userId: string) {
    const { gallery, startDate, endDate, ...rest } = data as any; // Cast data to any for destructuring if needed, or better type it

    const tripData: Prisma.TripCreateInput = {
      ...rest,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      createdBy: { connect: { id: userId } },
      itinerary: rest.itinerary || {},
      gallery:
        gallery && gallery.length > 0
          ? {
              create: gallery.map((g: { id: string }, index: number) => ({
                image: { connect: { id: g.id } },
                order: index,
              })),
            }
          : undefined,
    } as unknown as Prisma.TripCreateInput;

    const trip = await prisma.trip.create({
      data: tripData,
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
  async updateTrip(id: string, data: Record<string, unknown>, userId: string) {
    const { gallery, startDate, endDate, ...rest } = data as any;

    const tripData: Prisma.TripUpdateInput = {
      ...rest,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      gallery: gallery
        ? {
            deleteMany: {},
            create: gallery.map((g: { id: string }, index: number) => ({
              image: { connect: { id: g.id } },
              order: index,
            })),
          }
        : undefined,
    } as unknown as Prisma.TripUpdateInput;

    const trip = await prisma.trip.update({
      where: { id },
      data: tripData,
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
