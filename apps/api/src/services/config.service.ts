import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { EncryptionService } from "./encryption";

/**
 * ConfigService provides centralized access to server configuration
 * Reads from ServerConfiguration database with fallback to environment variables
 * Environment variables take precedence for production security
 */
class ConfigService {
  private cache: Map<string, { value: string; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get a configuration value
   * @param category Configuration category (e.g., "smtp", "payment")
   * @param key Configuration key (e.g., "smtp_host")
   * @param defaultValue Default value if not found
   * @returns The configuration value
   */
  async getConfig(
    category: string,
    key: string,
    defaultValue?: string,
  ): Promise<string | undefined> {
    const cacheKey = `${category}:${key}`;
    const cached = this.cache.get(cacheKey);

    // Return cached value if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    try {
      // Try to get from database
      const config = await prisma.serverConfiguration.findUnique({
        where: {
          category_key: { category, key },
        },
      });

      if (config) {
        // Cache the value
        this.cache.set(cacheKey, {
          value: config.value,
          timestamp: Date.now(),
        });

        return config.value;
      }
    } catch (error) {
      console.warn(`Failed to fetch config from database (${category}:${key}):`, error);
    }

    // Fallback to environment variable
    const envValue = this.getEnvValue(category, key);
    if (envValue) {
      return envValue;
    }

    return defaultValue;
  }

  /**
   * Get SMTP configuration
   */
  async getSMTPConfig() {
    return {
      host: await this.getConfig("smtp", "smtp_host", env.SMTP_HOST),
      port: await this.getConfig("smtp", "smtp_port", env.SMTP_PORT),
      user: await this.getConfig("smtp", "smtp_user", env.SMTP_USER),
      pass: await this.getConfig("smtp", "smtp_pass", env.SMTP_PASS),
      from: await this.getConfig("smtp", "smtp_from", env.SMTP_FROM),
    };
  }

  /**
   * Get Razorpay configuration
   */
  async getRazorpayConfig() {
    return {
      keyId: await this.getConfig("payment", "razorpay_key_id", env.RAZORPAY_KEY_ID),
      keySecret: await this.getConfig("payment", "razorpay_key_secret", env.RAZORPAY_KEY_SECRET),
      webhookSecret: await this.getConfig(
        "payment",
        "razorpay_webhook_secret",
        env.RAZORPAY_WEBHOOK_SECRET,
      ),
    };
  }

  /**
   * Get JWT configuration
   */
  async getJWTConfig() {
    return {
      accessSecret: await this.getConfig("system", "jwt_secret", env.JWT_ACCESS_SECRET),
      refreshSecret: await this.getConfig("system", "jwt_refresh_secret", env.JWT_REFRESH_SECRET),
    };
  }

  /**
   * Get Cloudinary configuration
   */
  async getCloudinaryConfig() {
    return {
      cloudName: await this.getConfig(
        "external",
        "cloudinary_cloud_name",
        env.CLOUDINARY_CLOUD_NAME,
      ),
      apiKey: await this.getConfig("external", "cloudinary_api_key", env.CLOUDINARY_API_KEY),
      apiSecret: await this.getConfig(
        "external",
        "cloudinary_api_secret",
        env.CLOUDINARY_API_SECRET,
      ),
    };
  }

  /**
   * Get environment variable value by category and key
   * Maps database keys to environment variable names
   */
  private getEnvValue(category: string, key: string): string | undefined {
    const keyMap: Record<string, Record<string, string>> = {
      smtp: {
        smtp_host: env.SMTP_HOST,
        smtp_port: env.SMTP_PORT,
        smtp_user: env.SMTP_USER,
        smtp_pass: env.SMTP_PASS,
        smtp_from: env.SMTP_FROM,
      },
      payment: {
        razorpay_key_id: env.RAZORPAY_KEY_ID,
        razorpay_key_secret: env.RAZORPAY_KEY_SECRET,
        razorpay_webhook_secret: env.RAZORPAY_WEBHOOK_SECRET,
      },
      system: {
        jwt_secret: env.JWT_ACCESS_SECRET,
        jwt_refresh_secret: env.JWT_REFRESH_SECRET,
      },
      external: {
        cloudinary_cloud_name: env.CLOUDINARY_CLOUD_NAME,
        cloudinary_api_key: env.CLOUDINARY_API_KEY,
        cloudinary_api_secret: env.CLOUDINARY_API_SECRET,
      },
    };

    return keyMap[category]?.[key];
  }

  /**
   * Invalidate cache for a specific key or all keys
   */
  invalidateCache(category?: string, key?: string): void {
    if (!category || !key) {
      this.cache.clear();
      return;
    }

    this.cache.delete(`${category}:${key}`);
  }

  /**
   * Update a configuration value
   * Primarily for internal use; external updates should go through the API
   */
  async updateConfig(
    category: string,
    key: string,
    value: string,
    isEncrypted: boolean = false,
  ): Promise<void> {
    let finalValue = value;

    if (isEncrypted) {
      try {
        finalValue = await EncryptionService.encrypt(value);
      } catch (error) {
        console.error("Failed to encrypt configuration value:", error);
        throw error;
      }
    }

    try {
      await prisma.serverConfiguration.upsert({
        where: {
          category_key: { category, key },
        },
        update: {
          value: finalValue,
          updatedAt: new Date(),
        },
        create: {
          category,
          key,
          value: finalValue,
          isEncrypted,
          isEnvironmentVar: false,
        },
      });

      this.invalidateCache(category, key);
    } catch (error) {
      console.error("Failed to update configuration:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const configService = new ConfigService();
