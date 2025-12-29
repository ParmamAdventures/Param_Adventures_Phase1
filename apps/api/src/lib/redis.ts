import Redis from "ioredis";
import { env } from "../config/env";

export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Critical for BullMQ
});

redisConnection.on("error", (err) => {
  console.error("Redis Connection Error:", err);
});

redisConnection.on("connect", () => {
  console.log("✅ Redis connected successfully");
});
