import { prisma } from "../lib/prisma";
import { auditService } from "./audit.service";

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

    await auditService.logAudit({
      actorId: userId,
      action: "TRIP_CREATED",
      targetType: "TRIP",
      targetId: trip.id,
      metadata: { status: trip.status },
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
        gallery: data.gallery ? {
           deleteMany: {},
           create: data.gallery.map((g: any, index: number) => ({
             imageId: g.id,
             order: index,
           }))
        } : undefined
      }
    });

    await auditService.logAudit({
      actorId: userId,
      action: "TRIP_UPDATED",
      targetType: "TRIP",
      targetId: trip.id,
    });

    return trip;
  }
}

export const tripService = new TripService();
