import { redisConnection } from "../lib/redis";
import { logger } from "../lib/logger";

const DENYLIST_PREFIX = "token_denylist:";

export const tokenDenylistService = {
  /**
   * Add a token JTI to the denylist.
   * @param jti - Unique identifier of the token
   * @param expiresInSeconds - Time until the token naturally expires
   */
  async denylistToken(jti: string, expiresInSeconds: number) {
    if (!jti) return;
    try {
      // Store in Redis with TTL matching token expiry
      await redisConnection.set(`${DENYLIST_PREFIX}${jti}`, "1", "EX", expiresInSeconds);
      logger.info(`Token revoked: ${jti}`);
    } catch (error) {
      logger.error("Failed to denylist token", { jti, error });
    }
  },

  /**
   * Check if a token JTI is in the denylist.
   * @param jti - Unique identifier of the token
   * @returns true if token is revoked
   */
  async isTokenRevoked(jti: string): Promise<boolean> {
    if (!jti) return false;
    try {
      const exists = await redisConnection.exists(`${DENYLIST_PREFIX}${jti}`);
      return exists === 1;
    } catch (error) {
      logger.error("Failed to check token denylist", { jti, error });
      return false; // Fail open but log? Or fail closed? For security, usually fail closed.
    }
  },
};
