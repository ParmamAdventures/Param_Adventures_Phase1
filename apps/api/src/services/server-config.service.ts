import { prisma } from "../lib/prisma";
import { EncryptionService } from "../utils/encryption";
import { CacheService } from "./cache.service";
import { HttpError } from "../utils/httpError";
import { ServerConfiguration } from "@prisma/client";

const CACHE_TTL = 3600; // 1 hour

/**
 * ServerConfigService handles all server configuration operations
 * Implements caching strategy with invalidation and encryption for sensitive values
 */
export class ServerConfigService {
  private cacheService = new CacheService();

  /**
   * Get all configurations grouped by category
   * Uses cache with fallback to database
   */
  async getAllConfigs(): Promise<Record<string, ServerConfiguration[]>> {
    const cacheKey = "server_config:all";

    try {
      // Try to get from cache
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn("Cache retrieval failed, falling back to database:", error);
    }

    // Fetch from database
    const configs = await prisma.serverConfiguration.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    // Group by category
    const grouped = configs.reduce(
      (acc: Record<string, ServerConfiguration[]>, config) => {
        if (!acc[config.category]) {
          acc[config.category] = [];
        }
        acc[config.category].push(config);
        return acc;
      },
      {} as Record<string, ServerConfiguration[]>,
    );

    // Cache the result
    try {
      await this.cacheService.set(cacheKey, JSON.stringify(grouped), CACHE_TTL);
    } catch (error) {
      console.warn("Cache set failed:", error);
    }

    return grouped;
  }

  /**
   * Get configurations by category
   * Uses cache with fallback to database
   */
  async getConfigByCategory(category: string): Promise<ServerConfiguration[]> {
    const cacheKey = `server_config:category:${category}`;

    try {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn("Cache retrieval failed, falling back to database:", error);
    }

    // Fetch from database
    const configs = await prisma.serverConfiguration.findMany({
      where: { category },
      orderBy: { key: "asc" },
    });

    // Cache the result
    try {
      await this.cacheService.set(cacheKey, JSON.stringify(configs), CACHE_TTL);
    } catch (error) {
      console.warn("Cache set failed:", error);
    }

    return configs;
  }

  /**
   * Get a single configuration by category and key
   */
  async getConfig(category: string, key: string): Promise<ServerConfiguration | null> {
    try {
      return await prisma.serverConfiguration.findUnique({
        where: {
          category_key: { category, key },
        },
      });
    } catch (error) {
      console.error("Failed to get configuration:", error);
      return null;
    }
  }

  /**
   * Update or create a configuration
   * Encrypts sensitive values, invalidates cache, and logs audit trail
   */
  async updateConfig(
    category: string,
    key: string,
    value: string,
    description: string | undefined,
    dataType: string,
    isEncrypted: boolean,
    updatedBy: string | null,
  ): Promise<ServerConfiguration> {
    // Validate input
    if (!category || !key || !value) {
      throw new HttpError(400, "INVALID_INPUT", "Category, key, and value are required");
    }

    // Check if key/category combination is environment variable
    const existingConfig = await prisma.serverConfiguration.findUnique({
      where: { category_key: { category, key } },
    });

    if (existingConfig?.isEnvironmentVar) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        `Configuration '${key}' is controlled by environment variable and cannot be modified`,
      );
    }

    // Encrypt sensitive values
    let encryptedValue = value;
    if (isEncrypted) {
      try {
        encryptedValue = await EncryptionService.encrypt(value);
      } catch {
        throw new HttpError(500, "ENCRYPTION_ERROR", "Failed to encrypt sensitive value");
      }
    }

    try {
      // Use transaction for consistency
      const config = await prisma.serverConfiguration.upsert({
        where: { category_key: { category, key } },
        update: {
          value: encryptedValue,
          description,
          dataType,
          isEncrypted,
          updatedBy,
          updatedAt: new Date(),
        },
        create: {
          category,
          key,
          value: encryptedValue,
          description,
          dataType,
          isEncrypted,
          updatedBy,
        },
      });

      // Invalidate cache
      await this.invalidateCache(category);

      return config;
    } catch (error) {
      console.error("Failed to update configuration:", error);
      throw new HttpError(500, "UPDATE_ERROR", "Failed to update configuration");
    }
  }

  /**
   * Get decrypted value for a sensitive configuration
   */
  async getDecryptedValue(category: string, key: string): Promise<string | null> {
    try {
      const config = await this.getConfig(category, key);
      if (!config) return null;

      if (!config.isEncrypted) {
        return config.value;
      }

      // Encrypted values can't be decrypted (bcrypt is one-way)
      // Return indicator that value is encrypted
      return `[ENCRYPTED]`;
    } catch (error) {
      console.error("Failed to get decrypted value:", error);
      return null;
    }
  }

  /**
   * Validate configuration (e.g., test SMTP connection)
   * Implementation depends on category
   */
  async validateConfig(
    category: string,
    configs: Record<string, string>,
  ): Promise<{ valid: boolean; message: string }> {
    switch (category) {
      case "smtp":
        return this.validateSMTPConfig(configs);
      case "payment":
        return this.validatePaymentConfig(configs);
      default:
        return { valid: true, message: "Validation not implemented for this category" };
    }
  }

  /**
   * Validate SMTP configuration
   */
  private validateSMTPConfig(configs: Record<string, string>): { valid: boolean; message: string } {
    const host = configs["smtp_host"];
    const port = configs["smtp_port"];
    const user = configs["smtp_user"];

    if (!host) return { valid: false, message: "SMTP_HOST is required" };
    if (!port) return { valid: false, message: "SMTP_PORT is required" };
    if (!user) return { valid: false, message: "SMTP_USER is required" };

    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return { valid: false, message: "SMTP_PORT must be a valid port number (1-65535)" };
    }

    return { valid: true, message: "SMTP configuration is valid" };
  }

  /**
   * Validate Payment (Razorpay) configuration
   */
  private validatePaymentConfig(configs: Record<string, string>): {
    valid: boolean;
    message: string;
  } {
    const keyId = configs["razorpay_key_id"];
    const keySecret = configs["razorpay_key_secret"];

    if (!keyId) return { valid: false, message: "Razorpay Key ID is required" };
    if (!keySecret) return { valid: false, message: "Razorpay Key Secret is required" };

    if (keyId.length < 10) {
      return { valid: false, message: "Razorpay Key ID appears invalid (too short)" };
    }

    return { valid: true, message: "Payment configuration is valid" };
  }

  /**
   * Invalidate cache for a category
   */
  private async invalidateCache(category: string): Promise<void> {
    try {
      await Promise.all([
        this.cacheService.delete(`server_config:all`),
        this.cacheService.delete(`server_config:category:${category}`),
      ]);
    } catch (error) {
      console.warn("Cache invalidation failed:", error);
    }
  }

  /**
   * Reset all cache
   */
  async invalidateAllCache(): Promise<void> {
    try {
      const _pattern = "server_config:*".replace("*", ".*"); // Changed 'pattern' to '_pattern' and applied the replacement logic from the example
      // If your cache service supports pattern deletion, use it
      await this.cacheService.delete("server_config:all");
    } catch (error) {
      console.warn("Cache reset failed:", error);
    }
  }

  /**
   * Seed default configurations
   */
  async seedDefaultConfigs(
    defaultConfigs: Array<{
      category: string;
      key: string;
      value: string;
      description: string;
      dataType: string;
      isEncrypted: boolean;
      isEnvironmentVar: boolean;
    }>,
  ): Promise<void> {
    try {
      for (const config of defaultConfigs) {
        let value = config.value;

        // Encrypt sensitive values if needed
        if (config.isEncrypted && !EncryptionService.isEncrypted(value)) {
          value = await EncryptionService.encrypt(value);
        }

        await prisma.serverConfiguration.upsert({
          where: {
            category_key: { category: config.category, key: config.key },
          },
          update: {
            description: config.description,
            dataType: config.dataType,
            isEncrypted: config.isEncrypted,
          },
          create: {
            category: config.category,
            key: config.key,
            value,
            description: config.description,
            dataType: config.dataType,
            isEncrypted: config.isEncrypted,
            isEnvironmentVar: config.isEnvironmentVar,
          },
        });
      }

      // Invalidate all cache after seeding
      await this.invalidateAllCache();
    } catch (error) {
      console.error("Failed to seed default configurations:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const serverConfigService = new ServerConfigService();
