import Redis from "ioredis";
import { env } from "../config/env";

export const createRedisClient = (options = {}) => {
  if (env.REDIS_URL) {
    console.log(`Connecting to Redis: ${env.REDIS_URL.replace(/:[^:@]+@/, ":****@")}`);
  }

  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    family: 4, // Force IPv4 to avoid ENOTFOUND on some environments
    ...options,
  });

  client.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  client.on("connect", () => {
    console.log("✅ Redis connected");
  });

  return client;
};

export const redisConnection = createRedisClient();
