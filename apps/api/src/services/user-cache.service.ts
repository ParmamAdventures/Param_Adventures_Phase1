import { CacheService, cacheService } from "./cache.service";
import { logger } from "../lib/logger";

/**
 * User Cache Service
 * Handles caching of user-related data with automatic invalidation
 *
 * Cache Keys:
 * - user:{id} - User profile with roles
 * - user:email:{email} - User lookup by email
 * - user:{id}:bookings - User's bookings
 * - user:{id}:saved-trips - User's saved trips
 * - user:{id}:reviews - User's reviews
 * - users:admins - Cached admin list
 *
 * TTLs:
 * - User profiles: 1 hour (3600s)
 * - User lists: 30 minutes (1800s)
 * - Email lookups: 2 hours (7200s)
 */
export class UserCacheService {
  private static cache: CacheService = cacheService;
  private static readonly TTL = {
    USER_PROFILE: 3600, // 1 hour
    USER_LIST: 1800, // 30 minutes
    EMAIL_LOOKUP: 7200, // 2 hours
    USER_BOOKINGS: 1800, // 30 minutes
    USER_SAVED_TRIPS: 1800, // 30 minutes
    USER_REVIEWS: 1800, // 30 minutes
    ADMIN_LIST: 3600, // 1 hour
  };

  /**
   * Get cached user by ID
   * Falls back to null if not in cache
   */
  static async getUserById(userId: string): Promise<any | null> {
    try {
      const key = `user:${userId}`;
      const cached = await this.cache.get(key);
      if (cached) {
        logger.info(`Cache HIT: User ${userId} loaded from cache`);
        return cached;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting user from cache: ${error}`);
      return null;
    }
  }

  /**
   * Cache user by ID
   */
  static async cacheUserById(userId: string, userData: any): Promise<void> {
    try {
      const key = `user:${userId}`;
      await this.cache.set(key, userData, this.TTL.USER_PROFILE);
      logger.info(`Cached user ${userId} for ${this.TTL.USER_PROFILE}s`);
    } catch (error) {
      logger.error(`Error caching user: ${error}`);
    }
  }

  /**
   * Get cached user by email
   */
  static async getUserByEmail(email: string): Promise<any | null> {
    try {
      const key = `user:email:${email}`;
      const cached = await this.cache.get(key);
      if (cached) {
        logger.info(`Cache HIT: User email ${email} loaded from cache`);
        return cached;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting user by email from cache: ${error}`);
      return null;
    }
  }

  /**
   * Cache user by email
   */
  static async cacheUserByEmail(email: string, userData: any): Promise<void> {
    try {
      const key = `user:email:${email}`;
      await this.cache.set(key, userData, this.TTL.EMAIL_LOOKUP);
      logger.info(`Cached user email ${email} for ${this.TTL.EMAIL_LOOKUP}s`);
    } catch (error) {
      logger.error(`Error caching user by email: ${error}`);
    }
  }

  /**
   * Get cached user bookings
   */
  static async getUserBookings(userId: string): Promise<any[] | null> {
    try {
      const key = `user:${userId}:bookings`;
      const cached = await this.cache.get(key);
      if (cached) {
        logger.info(`Cache HIT: User ${userId} bookings loaded from cache`);
        return cached;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting user bookings from cache: ${error}`);
      return null;
    }
  }

  /**
   * Cache user bookings
   */
  static async cacheUserBookings(userId: string, bookings: any[]): Promise<void> {
    try {
      const key = `user:${userId}:bookings`;
      await this.cache.set(key, bookings, this.TTL.USER_BOOKINGS);
      logger.info(`Cached ${bookings.length} bookings for user ${userId}`);
    } catch (error) {
      logger.error(`Error caching user bookings: ${error}`);
    }
  }

  /**
   * Get cached user saved trips
   */
  static async getUserSavedTrips(userId: string): Promise<any[] | null> {
    try {
      const key = `user:${userId}:saved-trips`;
      const cached = await this.cache.get(key);
      if (cached) {
        logger.info(`Cache HIT: User ${userId} saved trips loaded from cache`);
        return cached;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting user saved trips from cache: ${error}`);
      return null;
    }
  }

  /**
   * Cache user saved trips
   */
  static async cacheUserSavedTrips(userId: string, trips: any[]): Promise<void> {
    try {
      const key = `user:${userId}:saved-trips`;
      await this.cache.set(key, trips, this.TTL.USER_SAVED_TRIPS);
      logger.info(`Cached ${trips.length} saved trips for user ${userId}`);
    } catch (error) {
      logger.error(`Error caching user saved trips: ${error}`);
    }
  }

  /**
   * Get cached user reviews
   */
  static async getUserReviews(userId: string): Promise<any[] | null> {
    try {
      const key = `user:${userId}:reviews`;
      const cached = await this.cache.get(key);
      if (cached) {
        logger.info(`Cache HIT: User ${userId} reviews loaded from cache`);
        return cached;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting user reviews from cache: ${error}`);
      return null;
    }
  }

  /**
   * Cache user reviews
   */
  static async cacheUserReviews(userId: string, reviews: any[]): Promise<void> {
    try {
      const key = `user:${userId}:reviews`;
      await this.cache.set(key, reviews, this.TTL.USER_REVIEWS);
      logger.info(`Cached ${reviews.length} reviews for user ${userId}`);
    } catch (error) {
      logger.error(`Error caching user reviews: ${error}`);
    }
  }

  /**
   * Get cached admin list
   */
  static async getAdminList(): Promise<any[] | null> {
    try {
      const key = `users:admins`;
      const cached = await this.cache.get(key);
      if (cached) {
        logger.info(`Cache HIT: Admin list loaded from cache`);
        return cached;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting admin list from cache: ${error}`);
      return null;
    }
  }

  /**
   * Cache admin list
   */
  static async cacheAdminList(admins: any[]): Promise<void> {
    try {
      const key = `users:admins`;
      await this.cache.set(key, admins, this.TTL.ADMIN_LIST);
      logger.info(`Cached ${admins.length} admins for ${this.TTL.ADMIN_LIST}s`);
    } catch (error) {
      logger.error(`Error caching admin list: ${error}`);
    }
  }

  /**
   * Invalidate all user-related cache for a specific user
   */
  static async invalidateUser(userId: string): Promise<void> {
    try {
      const keys = [
        `user:${userId}`,
        `user:${userId}:bookings`,
        `user:${userId}:saved-trips`,
        `user:${userId}:reviews`,
      ];

      await this.cache.deleteMany(keys);
      logger.info(`Invalidated cache for user ${userId}`);
    } catch (error) {
      logger.error(`Error invalidating user cache: ${error}`);
    }
  }

  /**
   * Invalidate user email cache
   */
  static async invalidateUserByEmail(email: string): Promise<void> {
    try {
      const key = `user:email:${email}`;
      await this.cache.delete(key);
      logger.info(`Invalidated cache for user email ${email}`);
    } catch (error) {
      logger.error(`Error invalidating user email cache: ${error}`);
    }
  }

  /**
   * Invalidate admin list cache
   */
  static async invalidateAdminList(): Promise<void> {
    try {
      const key = `users:admins`;
      await this.cache.delete(key);
      logger.info(`Invalidated admin list cache`);
    } catch (error) {
      logger.error(`Error invalidating admin list cache: ${error}`);
    }
  }

  /**
   * Invalidate user bookings cache
   */
  static async invalidateUserBookings(userId: string): Promise<void> {
    try {
      const key = `user:${userId}:bookings`;
      await this.cache.delete(key);
      logger.info(`Invalidated bookings cache for user ${userId}`);
    } catch (error) {
      logger.error(`Error invalidating user bookings cache: ${error}`);
    }
  }

  /**
   * Invalidate user saved trips cache
   */
  static async invalidateUserSavedTrips(userId: string): Promise<void> {
    try {
      const key = `user:${userId}:saved-trips`;
      await this.cache.delete(key);
      logger.info(`Invalidated saved trips cache for user ${userId}`);
    } catch (error) {
      logger.error(`Error invalidating user saved trips cache: ${error}`);
    }
  }

  /**
   * Invalidate user reviews cache
   */
  static async invalidateUserReviews(userId: string): Promise<void> {
    try {
      const key = `user:${userId}:reviews`;
      await this.cache.delete(key);
      logger.info(`Invalidated reviews cache for user ${userId}`);
    } catch (error) {
      logger.error(`Error invalidating user reviews cache: ${error}`);
    }
  }

  /**
   * Flush all user-related cache
   */
  static async flushAllUserCache(): Promise<void> {
    try {
      await this.cache.invalidatePattern("user:*");
      logger.info(`Flushed all user cache`);
    } catch (error) {
      logger.error(`Error flushing user cache: ${error}`);
    }
  }
}
