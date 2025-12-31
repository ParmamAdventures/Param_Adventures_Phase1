import Redis from "ioredis";
import { env } from "../config/env";

export const createRedisClient = (options = {}) => {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
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
