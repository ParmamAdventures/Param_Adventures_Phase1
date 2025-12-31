import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError";

import { logger } from "../lib/logger";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err.message, { stack: err.stack });

  console.error("Global Error Handler Caught:", err); // Force console log

  if (err instanceof HttpError || err.name === "HttpError") {
    const status = (err as any).status || 500;
    const code = (err as any).code || "INTERNAL_ERROR";
    const message = err.message || "Internal Server Error";
    return res.status(status).json({ error: { code, message } });
  }

  // Handle Multer errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      error: {
        code: "UPLOAD_ERROR",
        message: err.message,
      },
    });
  }

  // Handle Prisma Validation errors
  if (err.name === "PrismaClientValidationError") {
    return res.status(400).json({
      error: {
        code: "DATABASE_VALIDATION_ERROR",
        message: "Invalid data format provided to database",
      },
    });
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "development" 
        ? (err.message || "Internal Server Error") 
        : "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}
