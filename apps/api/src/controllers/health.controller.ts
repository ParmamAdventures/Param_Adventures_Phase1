import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import * as fs from "fs";
import * as path from "path";

/**
 * Health check endpoint - verifies database connection and service availability.
 * Performs lightweight database query to validate connectivity.
 * Logs errors to health_error.log if check fails.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Returns JSON with status and services health
 * @throws {Error} - Re-throws any errors from database query
 */
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
    const logPath = path.join(process.cwd(), "health_error.log");
    fs.writeFileSync(logPath, `Health Check Failed: ${error}\nStack: ${(error as Error).stack}\n`);
    throw error; // Let global handler handle it too
  }
};
