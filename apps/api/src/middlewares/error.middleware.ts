import { Request, Response, NextFunction } from "express";
import { HttpError } from "../lib/httpError";

import { logger } from "../lib/logger";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err.message, { stack: err.stack });

  console.error("Global Error Handler Caught:", err); // Force console log

  if (err instanceof HttpError) {
    return res
      .status(err.status)
      .json({ error: { code: err.code, message: err.message } });
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
        error: {
            code: "UPLOAD_ERROR",
            message: err.message
        }
    });
  }

  // Handle Prisma Validation errors
  if (err.name === 'PrismaClientValidationError') {
     return res.status(400).json({
        error: {
            code: "DATABASE_VALIDATION_ERROR",
            message: "Invalid data format provided to database"
        }
     });
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: err.message || "Internal Server Error", // Send actual message in dev
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}
