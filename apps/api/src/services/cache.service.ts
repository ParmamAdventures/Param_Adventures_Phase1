import { logger } from "../lib/logger";
import { redisConnection } from "../lib/redis";

/**
 * Cache Service - Unified caching interface using Redis
 * Provides methods for setting, getting, and invalidating cache entries
 */
export class CacheService {
  private redis = redisConnection;
  private isConnected: boolean = false;

  constructor() {
    this.redis.on("connect", () => {
      this.isConnected = true;
      logger.info("Redis cache service connected");
    });

    this.redis.on("ready", () => {
      this.isConnected = true;
    });

    this.redis.on("error", (err) => {
      logger.error("Redis connection error:", err);
      // Don't set isConnected = false here strictly, let ioredis handle reconnect
    });

    this.redis.on("close", () => {
      this.isConnected = false;
      logger.warn("Redis connection closed");
    });

    // Check initial state
    if (this.redis.status === "ready" || this.redis.status === "connect") {
      this.isConnected = true;
    }
  }

  /**
   * Set a value in cache with optional TTL
   * @param key Cache key
   * @param value Value to cache (will be JSON stringified)
   * @param ttl Time to live in seconds (default: 3600 = 1 hour)
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    if (!this.isConnected) {
      logger.warn(`Cache set skipped - Redis not connected: ${key}`);
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttl > 0) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Parsed value or null if not found
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      if (!value) {
        logger.debug(`Cache miss: ${key}`);
        return null;
      }

      const parsed = JSON.parse(value);
      logger.debug(`Cache hit: ${key}`);
      return parsed as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a cache entry
   * @param key Cache key or pattern
   */
  async delete(key: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.redis.del(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple cache entries
   * @param keys Array of cache keys
   */
  async deleteMany(keys: string[]): Promise<void> {
    if (!this.isConnected || keys.length === 0) {
      return;
    }

    try {
      await this.redis.del(...keys);
      logger.debug(`Cache deleted: ${keys.length} keys`);
    } catch (error) {
      logger.error(`Cache deleteMany error:`, error);
    }
  }

  /**
   * Invalidate cache by pattern
   * @param pattern Redis pattern (e.g., "trips:*")
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache pattern invalidated: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      logger.error(`Cache pattern invalidation error for ${pattern}:`, error);
    }
  }

  /**
   * Get or set a value (cache-aside pattern)
   * @param key Cache key
   * @param factory Function to fetch data if not in cache
   * @param ttl Time to live in seconds
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl: number = 3600): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await factory();

    // Store in cache
    await this.set(key, data, ttl);

    return data;
  }

  /**
   * Flush all cache
   */
  async flush(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.redis.flushdb();
      logger.info("Cache flushed completely");
    } catch (error) {
      logger.error("Cache flush error:", error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    if (!this.isConnected) {
      return { connected: false };
    }

    try {
      const info = await this.redis.info("stats");
      const dbSize = await this.redis.dbsize();
      return { info, dbSize, connected: true };
    } catch (error: unknown) {
      logger.error("Cache stats error:", error);
      const message = error instanceof Error ? error.message : "Unknown cache error";
      return { error: message };
    }
  }

  /**
   * Check if cache service is connected
   */
  isHealthy(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect cache service
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
      this.isConnected = false;
      logger.info("Redis connection closed gracefully");
    } catch (error) {
      logger.error("Error closing Redis connection:", error);
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

export default CacheService;
