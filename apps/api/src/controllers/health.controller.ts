import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";

export const healthCheck = catchAsync(async (_req: Request, res: Response) => {
  // Perform a lightweight query to check DB connection
  await prisma.$queryRaw`SELECT 1`;

  return res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: "up",
    },
  });
});
