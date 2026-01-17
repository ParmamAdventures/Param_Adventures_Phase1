import { CacheService } from "./cache.service";
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
  private cache: CacheService;
  private tripCache: TripCacheService;
  private userCache: UserCacheService;
  private invalidationLog: Map<string, number> = new Map();

  constructor(cache: CacheService, tripCache: TripCacheService, userCache: UserCacheService) {
    this.cache = cache;
    this.tripCache = tripCache;
    this.userCache = userCache;
  }

  /**
   * Immediate invalidation - directly delete from cache
   * Used for: Critical updates that must reflect immediately
   */
  async invalidateImmediate(keys: string | string[]): Promise<void> {
    try {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      await this.cache.deleteMany(keyArray);
      this.logInvalidation("immediate", keyArray.length);
      logger.info(`Immediate invalidation: ${keyArray.length} keys deleted`);
    } catch (error) {
      logger.error(`Error in immediate invalidation: ${error}`);
    }
  }

  /**
   * Pattern-based invalidation - invalidate all keys matching a pattern
   * Used for: Cascade invalidation (e.g., when a category changes, invalidate all related trips)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      await this.cache.invalidatePattern(pattern);
      this.logInvalidation("pattern", 1, pattern);
      logger.info(`Pattern invalidation: ${pattern}`);
    } catch (error) {
      logger.error(`Error in pattern invalidation: ${error}`);
    }
  }

  /**
   * TTL-based refresh - set a shorter TTL to gradually expire cache
   * Used for: Non-critical data where eventual consistency is acceptable
   */
  async invalidateWithFallback(key: string, fallbackTTL: number = 300): Promise<void> {
    try {
      const data = await this.cache.get(key);
      if (data) {
        // Re-cache with shorter TTL (default 5 minutes)
        await this.cache.set(key, data, fallbackTTL);
        this.logInvalidation("fallback", 1, key, fallbackTTL);
        logger.info(`Fallback invalidation: ${key} TTL reduced to ${fallbackTTL}s`);
      } else {
        // Key not in cache, direct delete
        await this.cache.delete(key);
        this.logInvalidation("fallback-delete", 1, key);
      }
    } catch (error) {
      logger.error(`Error in fallback invalidation: ${error}`);
    }
  }

  /**
   * Cascade invalidation - invalidate dependent caches
   * Used for: When a resource changes, invalidate all dependent resources
   */
  async invalidateCascade(tripId: string): Promise<void> {
    try {
      // Invalidate trip itself
      await this.tripCache.invalidateTrip(tripId);

      // Invalidate all trip-related lists
      await this.invalidatePattern(`trip:${tripId}:*`);
      await this.invalidatePattern("trips:*");

      this.logInvalidation("cascade", 3);
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
  async onTripUpdated(tripId: string): Promise<void> {
    try {
      await this.invalidateCascade(tripId);
      logger.info(`Cache invalidated for trip update: ${tripId}`);
    } catch (error) {
      logger.error(`Error handling trip update event: ${error}`);
    }
  }

  async onTripDeleted(tripId: string): Promise<void> {
    try {
      await this.invalidateCascade(tripId);
      logger.info(`Cache invalidated for trip deletion: ${tripId}`);
    } catch (error) {
      logger.error(`Error handling trip delete event: ${error}`);
    }
  }

  async onTripCreated(tripId: string): Promise<void> {
    try {
      // When a new trip is created, invalidate the "all trips" cache
      await this.invalidatePattern("trips:*");
      logger.info(`Cache invalidated for new trip: ${tripId}`);
    } catch (error) {
      logger.error(`Error handling trip create event: ${error}`);
    }
  }

  async onBookingCreated(userId: string, tripId: string): Promise<void> {
    try {
      // Invalidate user's bookings list
      await this.userCache.invalidateUserBookings(userId);

      // Invalidate trip's booking count and details
      await this.tripCache.invalidateTrip(tripId);

      logger.info(`Cache invalidated for new booking: user ${userId}, trip ${tripId}`);
    } catch (error) {
      logger.error(`Error handling booking create event: ${error}`);
    }
  }

  async onBookingConfirmed(userId: string, tripId: string): Promise<void> {
    try {
      // Invalidate user's bookings
      await this.userCache.invalidateUserBookings(userId);

      // Invalidate trip details (booking count may have changed)
      await this.tripCache.invalidateTrip(tripId);

      logger.info(`Cache invalidated for booking confirmation: user ${userId}, trip ${tripId}`);
    } catch (error) {
      logger.error(`Error handling booking confirmation event: ${error}`);
    }
  }

  async onUserProfileUpdated(userId: string): Promise<void> {
    try {
      await this.userCache.invalidateUser(userId);
      logger.info(`Cache invalidated for user profile update: ${userId}`);
    } catch (error) {
      logger.error(`Error handling user profile update event: ${error}`);
    }
  }

  async onUserRoleChanged(userId: string): Promise<void> {
    try {
      // Invalidate the specific user
      await this.userCache.invalidateUser(userId);

      // Invalidate admin list if user became/stopped being admin
      await this.userCache.invalidateAdminList();

      logger.info(`Cache invalidated for user role change: ${userId}`);
    } catch (error) {
      logger.error(`Error handling user role change event: ${error}`);
    }
  }

  async onReviewAdded(tripId: string, userId: string): Promise<void> {
    try {
      // Invalidate trip details (review count/rating changed)
      await this.tripCache.invalidateTrip(tripId);

      // Invalidate user's reviews
      await this.userCache.invalidateUserReviews(userId);

      logger.info(`Cache invalidated for new review: trip ${tripId}, user ${userId}`);
    } catch (error) {
      logger.error(`Error handling review add event: ${error}`);
    }
  }

  async onTripSaved(userId: string, tripId: string): Promise<void> {
    try {
      // Invalidate user's saved trips
      await this.userCache.invalidateUserSavedTrips(userId);

      logger.info(`Cache invalidated for saved trip: user ${userId}, trip ${tripId}`);
    } catch (error) {
      logger.error(`Error handling trip save event: ${error}`);
    }
  }

  /**
   * Bulk invalidation - invalidate multiple related resources at once
   * Used for: Admin operations that affect multiple resources
   */
  async invalidateBulk(
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
              await this.tripCache.invalidateTrip(inv.id);
              count++;
            }
            break;
          case "user":
            if (inv.id) {
              await this.userCache.invalidateUser(inv.id);
              count++;
            }
            break;
          case "pattern":
            if (inv.pattern) {
              await this.invalidatePattern(inv.pattern);
              count++;
            }
            break;
          case "key":
            if (inv.key) {
              await this.cache.delete(inv.key);
              count++;
            }
            break;
        }
      }

      this.logInvalidation("bulk", count);
      logger.info(`Bulk invalidation completed: ${count} operations`);
    } catch (error) {
      logger.error(`Error in bulk invalidation: ${error}`);
    }
  }

  /**
   * Smart invalidation - invalidates only if cache exists
   * Reduces unnecessary operations
   */
  async invalidateSmart(key: string): Promise<boolean> {
    try {
      const exists = await this.cache.get(key);
      if (exists) {
        await this.cache.delete(key);
        this.logInvalidation("smart", 1, key);
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
      totalInvalidations: Array.from(this.invalidationLog.values()).reduce((a, b) => a + b, 0),
      byType: {} as Record<string, number>,
      recentInvalidations: Array.from(this.invalidationLog.keys()).slice(-10),
    };

    // Group by type
    for (const [key, count] of this.invalidationLog.entries()) {
      const type = key.split(":")[0];
      stats.byType[type] = (stats.byType[type] || 0) + count;
    }

    return stats;
  }

  /**
   * Reset invalidation log (for monitoring)
   */
  resetStats(): void {
    this.invalidationLog.clear();
    logger.info("Invalidation statistics reset");
  }

  /**
   * Log invalidation for monitoring and debugging
   */
  private logInvalidation(type: string, count: number, detail?: string, ttl?: number): void {
    const timestamp = new Date().toISOString();
    const key = `${type}:${timestamp}`;

    if (detail) {
      logger.debug(`[${type}] ${detail}${ttl ? ` (TTL: ${ttl}s)` : ""}`);
    }

    this.invalidationLog.set(key, count);

    // Keep only last 1000 entries to avoid memory leak
    if (this.invalidationLog.size > 1000) {
      const firstKey = this.invalidationLog.keys().next().value;
      this.invalidationLog.delete(firstKey);
    }
  }
}
