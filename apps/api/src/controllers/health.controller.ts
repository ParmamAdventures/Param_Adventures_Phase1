import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";

import * as fs from 'fs';
import * as path from 'path';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Perform a lightweight query to check DB connection
    await prisma.$queryRaw`SELECT 1`;

    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        database: "up",
      },
    });
  } catch (error) {
    const logPath = path.join(process.cwd(), 'health_error.log');
    fs.writeFileSync(logPath, `Health Check Failed: ${error}\nStack: ${(error as Error).stack}\n`);
    throw error; // Let global handler handle it too
  }
};
