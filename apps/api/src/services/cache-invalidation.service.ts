import { cacheService } from "./cache.service";
import { TripCacheService } from "./trip-cache.service";
import { UserCacheService } from "./user-cache.service";
import { logger } from "../lib/logger";

/**
 * Cache Invalidation Service
 * Handles intelligent cache invalidation strategies across the application
 *
 * Strategies:
 * - Immediate: Direct invalidation (fast, used for critical updates)
 * - Lazy: Mark as stale, invalidate on next read (eventual consistency)
 * - TTL-based: Let cache expire naturally (background refresh)
 * - Pattern: Invalidate related caches in one operation (cascade)
 * - Event-driven: Listen to domain events and invalidate accordingly
 */
export class CacheInvalidationService {
  private static invalidationLog: Map<string, number> = new Map();

  /**
   * Immediate invalidation - directly delete from cache
   * Used for: Critical updates that must reflect immediately
   */
  static async invalidateImmediate(keys: string | string[]): Promise<void> {
    try {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      await cacheService.deleteMany(keyArray);
      CacheInvalidationService.logInvalidation("immediate", keyArray.length);
      logger.info(`Immediate invalidation: ${keyArray.length} keys deleted`);
    } catch (error) {
      logger.error(`Error in immediate invalidation: ${error}`);
    }
  }

  /**
   * Pattern-based invalidation - invalidate all keys matching a pattern
   * Used for: Cascade invalidation (e.g., when a category changes, invalidate all related trips)
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      await cacheService.invalidatePattern(pattern);
      CacheInvalidationService.logInvalidation("pattern", 1, pattern);
      logger.info(`Pattern invalidation: ${pattern}`);
    } catch (error) {
      logger.error(`Error in pattern invalidation: ${error}`);
    }
  }

  /**
   * TTL-based refresh - set a shorter TTL to gradually expire cache
   * Used for: Non-critical data where eventual consistency is acceptable
   */
  static async invalidateWithFallback(key: string, fallbackTTL: number = 300): Promise<void> {
    try {
      const data = await cacheService.get(key);
      if (data) {
        // Re-cache with shorter TTL (default 5 minutes)
        await cacheService.set(key, data, fallbackTTL);
        CacheInvalidationService.logInvalidation("fallback", 1, key, fallbackTTL);
        logger.info(`Fallback invalidation: ${key} TTL reduced to ${fallbackTTL}s`);
      } else {
        // Key not in cache, direct delete
        await cacheService.delete(key);
        CacheInvalidationService.logInvalidation("fallback-delete", 1, key);
      }
    } catch (error) {
      logger.error(`Error in fallback invalidation: ${error}`);
    }
  }

  /**
   * Cascade invalidation - invalidate dependent caches
   * Used for: When a resource changes, invalidate all dependent resources
   */
  static async invalidateCascade(tripId: string): Promise<void> {
    try {
      // Invalidate trip itself
      await TripCacheService.invalidateTripById(tripId);

      // Invalidate all trip-related lists
      await CacheInvalidationService.invalidatePattern(`trip:${tripId}:*`);
      await CacheInvalidationService.invalidatePattern("trips:*");

      CacheInvalidationService.logInvalidation("cascade", 3);
      logger.info(`Cascade invalidation for trip ${tripId}: deleted trip + related + lists`);
    } catch (error) {
      logger.error(`Error in cascade invalidation: ${error}`);
    }
  }

  /**
   * Event-driven invalidation - responds to domain events
   * Called when:
   * - A trip is created/updated/deleted
   * - A booking is confirmed
   * - A review is added
   * - A user updates profile
   */
  static async onTripUpdated(tripId: string): Promise<void> {
    try {
      await this.invalidateCascade(tripId);
      logger.info(`Cache invalidated for trip update: ${tripId}`);
    } catch (error) {
      logger.error(`Error handling trip update event: ${error}`);
    }
  }

  static async onTripDeleted(tripId: string): Promise<void> {
    try {
      await this.invalidateCascade(tripId);
      logger.info(`Cache invalidated for trip deletion: ${tripId}`);
    } catch (error) {
      logger.error(`Error handling trip delete event: ${error}`);
    }
  }

  static async onTripCreated(tripId: string): Promise<void> {
    try {
      // When a new trip is created, invalidate the "all trips" cache
      await CacheInvalidationService.invalidatePattern("trips:*");
      logger.info(`Cache invalidated for new trip: ${tripId}`);
    } catch (error) {
      logger.error(`Error handling trip create event: ${error}`);
    }
  }

  static async onBookingCreated(userId: string, tripId: string): Promise<void> {
    try {
      // Invalidate user's bookings list
      await UserCacheService.invalidateUserBookings(userId);

      // Invalidate trip's booking count and details
      await TripCacheService.invalidateTripById(tripId);

      logger.info(`Cache invalidated for new booking: user ${userId}, trip ${tripId}`);
    } catch (error) {
      logger.error(`Error handling booking create event: ${error}`);
    }
  }

  static async onBookingConfirmed(userId: string, tripId: string): Promise<void> {
    try {
      // Invalidate user's bookings
      await UserCacheService.invalidateUserBookings(userId);

      // Invalidate trip details (booking count may have changed)
      await TripCacheService.invalidateTripById(tripId);

      logger.info(`Cache invalidated for booking confirmation: user ${userId}, trip ${tripId}`);
    } catch (error) {
      logger.error(`Error handling booking confirmation event: ${error}`);
    }
  }

  static async onUserProfileUpdated(userId: string): Promise<void> {
    try {
      await UserCacheService.invalidateUser(userId);
      logger.info(`Cache invalidated for user profile update: ${userId}`);
    } catch (error) {
      logger.error(`Error handling user profile update event: ${error}`);
    }
  }

  static async onUserRoleChanged(userId: string): Promise<void> {
    try {
      // Invalidate the specific user
      await UserCacheService.invalidateUser(userId);

      // Invalidate admin list if user became/stopped being admin
      await UserCacheService.invalidateAdminList();

      logger.info(`Cache invalidated for user role change: ${userId}`);
    } catch (error) {
      logger.error(`Error handling user role change event: ${error}`);
    }
  }

  static async onReviewAdded(tripId: string, userId: string): Promise<void> {
    try {
      // Invalidate trip details (review count/rating changed)
      await TripCacheService.invalidateTripById(tripId);

      // Invalidate user's reviews
      await UserCacheService.invalidateUserReviews(userId);

      logger.info(`Cache invalidated for new review: trip ${tripId}, user ${userId}`);
    } catch (error) {
      logger.error(`Error handling review add event: ${error}`);
    }
  }

  static async onTripSaved(userId: string, tripId: string): Promise<void> {
    try {
      // Invalidate user's saved trips
      await UserCacheService.invalidateUserSavedTrips(userId);

      logger.info(`Cache invalidated for saved trip: user ${userId}, trip ${tripId}`);
    } catch (error) {
      logger.error(`Error handling trip save event: ${error}`);
    }
  }

  /**
   * Bulk invalidation - invalidate multiple related resources at once
   * Used for: Admin operations that affect multiple resources
   */
  static async invalidateBulk(
    invalidations: Array<{
      type: "trip" | "user" | "pattern" | "key";
      id?: string;
      pattern?: string;
      key?: string;
    }>,
  ): Promise<void> {
    try {
      let count = 0;

      for (const inv of invalidations) {
        switch (inv.type) {
          case "trip":
            if (inv.id) {
              await TripCacheService.invalidateTripById(inv.id);
              count++;
            }
            break;
          case "user":
            if (inv.id) {
              await UserCacheService.invalidateUser(inv.id);
              count++;
            }
            break;
          case "pattern":
            if (inv.pattern) {
              await CacheInvalidationService.invalidatePattern(inv.pattern);
              count++;
            }
            break;
          case "key":
            if (inv.key) {
              await cacheService.delete(inv.key);
              count++;
            }
            break;
        }
      }

      CacheInvalidationService.logInvalidation("bulk", count);
      logger.info(`Bulk invalidation completed: ${count} operations`);
    } catch (error) {
      logger.error(`Error in bulk invalidation: ${error}`);
    }
  }

  /**
   * Smart invalidation - invalidates only if cache exists
   * Reduces unnecessary operations
   */
  static async invalidateSmart(key: string): Promise<boolean> {
    try {
      const exists = await cacheService.get(key);
      if (exists) {
        await cacheService.delete(key);
        CacheInvalidationService.logInvalidation("smart", 1, key);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error in smart invalidation: ${error}`);
      return false;
    }
  }

  /**
   * Get invalidation statistics
   */
  getStats(): {
    totalInvalidations: number;
    byType: Record<string, number>;
    recentInvalidations: string[];
  } {
    const stats = {
      totalInvalidations: Array.from(CacheInvalidationService.invalidationLog.values()).reduce(
        (a, b) => a + b,
        0,
      ),
      byType: {} as Record<string, number>,
      recentInvalidations: Array.from(CacheInvalidationService.invalidationLog.keys()).slice(-10),
    };

    // Group by type
    for (const [key, count] of CacheInvalidationService.invalidationLog.entries()) {
      const type = key.split(":")[0];
      stats.byType[type] = (stats.byType[type] || 0) + count;
    }

    return stats;
  }

  /**
   * Reset invalidation log (for monitoring)
   */
  resetStats(): void {
    CacheInvalidationService.invalidationLog.clear();
    logger.info("Invalidation statistics reset");
  }

  /**
   * Log invalidation for monitoring and debugging
   */
  private static logInvalidation(type: string, count: number, detail?: string, ttl?: number): void {
    const timestamp = new Date().toISOString();
    const key = `${type}:${timestamp}`;

    if (detail) {
      logger.debug(`[${type}] ${detail}${ttl ? ` (TTL: ${ttl}s)` : ""}`);
    }

    CacheInvalidationService.invalidationLog.set(key, count);

    // Keep only last 1000 entries to avoid memory leak
    if (CacheInvalidationService.invalidationLog.size > 1000) {
      const keys = CacheInvalidationService.invalidationLog.keys();
      const firstKey = keys.next().value;
      if (firstKey) {
        CacheInvalidationService.invalidationLog.delete(firstKey);
      }
    }
  }
}
