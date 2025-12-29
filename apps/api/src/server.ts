import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";

const server = app.listen(Number(env.PORT), () => {
  logger.info(`API running on port ${env.PORT}`);
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
    process.exit(0);
  } catch (err) {
    logger.error("Error during shutdown", { error: err });
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
