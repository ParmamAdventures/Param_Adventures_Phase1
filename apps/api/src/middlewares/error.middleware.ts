import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError";

import { logger } from "../lib/logger";

import * as Sentry from "@sentry/node";

type MaybeHttpError = {
  status?: number;
  code?: string;
  message?: string;
};

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // Structured error logging
  logger.error("Unhandled error", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Send error to Sentry (non-blocking)
  Sentry.captureException(err);

  // HttpError: typed path without any-casts
  if (err instanceof HttpError || err.name === "HttpError") {
    const httpErr = err as HttpError;
    const status = httpErr.status ?? 500;
    const code = httpErr.code ?? "INTERNAL_ERROR";
    const message = httpErr.message ?? "Internal Server Error";
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

  // Fallback: try read status/code if present on unknown error
  const maybe = err as MaybeHttpError;
  const status = typeof maybe.status === "number" ? maybe.status : 500;
  const code = typeof maybe.code === "string" ? maybe.code : "INTERNAL_ERROR";
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: {
      code,
      message: process.env.NODE_ENV === "development"
        ? message
        : "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}
