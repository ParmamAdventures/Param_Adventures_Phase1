import { createServer } from "http";
import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { notificationWorker } from "./lib/queue";
import { redisConnection } from "./lib/redis";
import { initSocket } from "./lib/socket";

const httpServer = createServer(app);
initSocket(httpServer);

const port = Number(env.PORT) || 3000;
const server = httpServer.listen(port, "0.0.0.0", () => {
  logger.info(`🚀 API running on http://0.0.0.0:${port}`);
  console.log(`🚀 API running on http://0.0.0.0:${port}`);
});

import { prisma } from "./lib/prisma";

async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed.");
  });

  try {
    await prisma.$disconnect();
    logger.info("Database disconnected.");

    await notificationWorker.close();
    await redisConnection.quit();
    logger.info("Background systems stopped.");

    process.exit(0);
  } catch (err) {
    logger.error("Error during shutdown", { error: err });
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
