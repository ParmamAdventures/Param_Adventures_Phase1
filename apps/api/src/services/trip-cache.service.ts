import { prisma } from "../lib/prisma";
import { Prisma, Trip, TripCategory, TripStatus } from "@prisma/client";
import { cacheService } from "./cache.service";
import { logger } from "../lib/logger";

/**
 * Trip Cache Service - Specialized caching for trip data
 * Implements cache-aside pattern with automatic invalidation
 */
export class TripCacheService {
  /**
   * Cache key prefixes
   */
  private static readonly KEYS = {
    TRIP: (id: string) => `trip:${id}`,
    TRIP_SLUG: (slug: string) => `trip:slug:${slug}`,
    TRIPS_PUBLIC: () => "trips:public:all",
    TRIPS_CATEGORY: (category: string) => `trips:category:${category}`,
    TRIPS_FEATURED: () => "trips:featured",
    TRIPS_PATTERN: () => "trip:*",
  };

  /**
   * Cache TTLs (in seconds)
   */
  private static readonly TTL = {
    TRIP: 3600, // 1 hour
    TRIPS_LIST: 1800, // 30 minutes
    FEATURED: 1800, // 30 minutes
  };

  /**
   * Get public trips with caching
   * @param filters Optional filters (category, difficulty, etc.)
   */
  static async getPublicTrips(filters?: {
    category?: string;
    difficulty?: string;
    skip?: number;
    take?: number;
  }) {
    const cacheKey = filters?.category
      ? this.KEYS.TRIPS_CATEGORY(filters.category)
      : this.KEYS.TRIPS_PUBLIC();

    try {
      return await cacheService.getOrSet(
        cacheKey,
        async () => {
          logger.debug(`Fetching public trips from database (filters: ${JSON.stringify(filters)})`);

          const where: Prisma.TripWhereInput = {
            status: TripStatus.PUBLISHED,
          };

          if (filters?.category) {
            // Cast to enum to satisfy strict Prisma typing when filters come from query params
            where.category = filters.category as TripCategory;
          }

          const trips = await prisma.trip.findMany({
            where,
            include: {
              manager: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
            skip: filters?.skip || 0,
            take: filters?.take || 20,
            orderBy: { createdAt: "desc" },
          });

          return trips;
        },
        this.TTL.TRIPS_LIST,
      );
    } catch (error) {
      logger.error("Error fetching public trips:", error);
      throw error;
    }
  }

  /**
   * Get featured trips with caching
   */
  static async getFeaturedTrips() {
    try {
      return await cacheService.getOrSet(
        this.KEYS.TRIPS_FEATURED(),
        async () => {
          logger.debug("Fetching featured trips from database");

          const trips = await prisma.trip.findMany({
            where: {
              status: TripStatus.PUBLISHED,
              isFeatured: true,
            },
            include: {
              manager: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
            take: 6,
            orderBy: { createdAt: "desc" },
          });

          return trips;
        },
        this.TTL.FEATURED,
      );
    } catch (error) {
      logger.error("Error fetching featured trips:", error);
      throw error;
    }
  }

  /**
   * Get trip by slug with caching
   */
  static async getTripBySlug(slug: string) {
    const cacheKey = this.KEYS.TRIP_SLUG(slug);

    try {
      return await cacheService.getOrSet(
        cacheKey,
        async () => {
          logger.debug(`Fetching trip by slug from database: ${slug}`);

          const trip = await prisma.trip.findUnique({
            where: { slug },
            include: {
              manager: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
              reviews: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatarUrl: true,
                    },
                  },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
              },
            },
          });

          return trip;
        },
        this.TTL.TRIP,
      );
    } catch (error) {
      logger.error(`Error fetching trip by slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Get trip by ID with caching
   */
  static async getTripById(tripId: string) {
    const cacheKey = this.KEYS.TRIP(tripId);

    try {
      return await cacheService.getOrSet(
        cacheKey,
        async () => {
          logger.debug(`Fetching trip by ID from database: ${tripId}`);

          return await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
              manager: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          });
        },
        this.TTL.TRIP,
      );
    } catch (error) {
      logger.error(`Error fetching trip by ID ${tripId}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate trip cache when trip is updated
   */
  static async invalidateTrip(trip: Trip) {
    const keysToInvalidate = [
      this.KEYS.TRIP(trip.id),
      this.KEYS.TRIP_SLUG(trip.slug),
      this.KEYS.TRIPS_PUBLIC(),
      this.KEYS.TRIPS_FEATURED(),
      this.KEYS.TRIPS_CATEGORY(trip.category),
    ];

    logger.debug(`Invalidating cache for trip: ${trip.id}`);
    await cacheService.deleteMany(keysToInvalidate);
  }

  /**
   * Invalidate all trip caches
   */
  static async invalidateAllTrips() {
    logger.info("Invalidating all trip caches");
    await cacheService.invalidatePattern(this.KEYS.TRIPS_PATTERN());
  }

  /**
   * Get cache status for trips
   */
  static async getCacheStats() {
    return await cacheService.getStats();
  }

  /**
   * Clear all trip caches
   */
  static async clearCache() {
    logger.info("Clearing all trip caches");
    await this.invalidateAllTrips();
  }
}

export default TripCacheService;
