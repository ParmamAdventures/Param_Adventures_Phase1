import { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/client";
import * as Sentry from "@sentry/node";

import { logger } from "../lib/logger";
import { HttpError } from "../utils/httpError";
import { ApiResponse } from "../utils/ApiResponse";

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

/**
 * Global error handler middleware.
 * Catches all errors, logs them, sends to Sentry, and returns structured error response.
 * Handles HttpError, Prisma errors, validation errors, and generic errors.
 * Prevents sending response if headers already sent.
 * @param {Error} err - Error object from upstream
 * @param {Request} _req - Express request object (unused)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void} - Sends structured error response or passes to next handler
 */
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
    return ApiResponse.error(res, code, message, status);
  }

  // Handle Prisma known request errors (e.g., unique constraint violations)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const status = err.code === "P2002" ? 409 : 400;
    const code = err.code === "P2002" ? "CONFLICT" : "DATABASE_ERROR";
    const message = err.code === "P2002" ? "Resource already exists" : "Database request error";

    return ApiResponse.error(
      res,
      code,
      isDev ? message : "Database error",
      status,
      isDev ? err.meta : undefined,
    );
  }

  // Handle Prisma Validation errors
  if (err.name === "PrismaClientValidationError") {
    return ApiResponse.error(
      res,
      "DATABASE_VALIDATION_ERROR",
      "Invalid data format provided to database",
      400,
    );
  }

  // Handle Multer errors
  if (err.name === "MulterError") {
    return ApiResponse.error(res, "UPLOAD_ERROR", err.message, 400);
  }

  // Fallback: try read status/code if present on unknown error
  const maybe = err as MaybeHttpError;
  const status = typeof maybe.status === "number" ? maybe.status : 500;
  const code = typeof maybe.code === "string" ? maybe.code : "INTERNAL_ERROR";
  const message = err.message || "Internal Server Error";

  return ApiResponse.error(
    res,
    code,
    isDev ? message : "Internal Server Error",
    status,
    isDev ? err.stack : undefined,
  );
}
