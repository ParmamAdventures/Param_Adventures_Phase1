import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { logger } from "../lib/logger";

const prisma = new PrismaClient();

export async function healthCheck(_req: Request, res: Response) {
  try {
    // Perform a lightweight query to check DB connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        database: "up",
      },
    });
  } catch (error) {
    logger.error("Health Check Failed", { error });
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      services: {
        database: "down",
      },
      message: "Database connectivity issue",
    });
  }
}
