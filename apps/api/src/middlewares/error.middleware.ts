import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import * as Sentry from "@sentry/node";

import { logger } from "../lib/logger";
import { HttpError } from "../utils/httpError";

type MaybeHttpError = {
  status?: number;
  code?: string;
  message?: string;
};

const isDev = process.env.NODE_ENV === "development";

type ErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
};

function buildError(code: string, message: string, details?: unknown, stack?: string) {
  const payload: ErrorPayload = {
    code,
    message,
    ...(isDev && details ? { details } : {}),
    ...(isDev && stack ? { stack } : {}),
  };

  return { error: payload };
}

export function errorHandler(err: Error, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

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
    return res.status(status).json(buildError(code, message));
  }

  // Handle Prisma known request errors (e.g., unique constraint violations)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const status = err.code === "P2002" ? 409 : 400;
    const code = err.code === "P2002" ? "CONFLICT" : "DATABASE_ERROR";
    const message = err.code === "P2002" ? "Resource already exists" : "Database request error";

    return res.status(status).json(buildError(code, isDev ? message : "Database error", err.meta));
  }

  // Handle Prisma Validation errors
  if (err.name === "PrismaClientValidationError") {
    return res
      .status(400)
      .json(buildError("DATABASE_VALIDATION_ERROR", "Invalid data format provided to database"));
  }

  // Handle Multer errors
  if (err.name === "MulterError") {
    return res.status(400).json(buildError("UPLOAD_ERROR", err.message));
  }

  // Fallback: try read status/code if present on unknown error
  const maybe = err as MaybeHttpError;
  const status = typeof maybe.status === "number" ? maybe.status : 500;
  const code = typeof maybe.code === "string" ? maybe.code : "INTERNAL_ERROR";
  const message = err.message || "Internal Server Error";

  res
    .status(status)
    .json(buildError(code, isDev ? message : "Internal Server Error", null, err.stack));
}
