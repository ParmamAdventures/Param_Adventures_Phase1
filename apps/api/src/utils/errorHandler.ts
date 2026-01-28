/**
 * Error Handler Utilities
 * Provides type-safe error handling utilities
 */

/**
 * Converts unknown error to Error instance
 * @param error - Unknown error from catch block
 * @returns Error instance
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}

/**
 * Gets error message safely from unknown error
 * @param error - Unknown error
 * @param fallback - Fallback message if error has no message
 * @returns Error message string
 */
export function getErrorMessage(error: unknown, fallback = "An unknown error occurred"): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return fallback;
}

/**
 * Type guard to check if error is an Error instance
 * @param error - Unknown error
 * @returns true if error is Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Logs error with proper typing
 * @param logger - Logger instance
 * @param error - Unknown error
 * @param context - Additional context string
 */
interface Logger {
  error(message: string, meta?: Record<string, unknown>): void;
}

export function logError(logger: Logger, error: unknown, context?: string): void {
  const err = toError(error);
  const message = context ? `${context}: ${err.message}` : err.message;
  logger.error(message, { stack: err.stack });
}

/**
 * Standard error handler for try-catch blocks
 * Use this in catch blocks for consistent error handling
 *
 * @example
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError(error, logger, "Operation failed");
 * }
 */
export function handleError(error: unknown, logger?: Logger, context?: string): Error {
  const err = toError(error);

  if (logger) {
    logError(logger, err, context);
  }

  return err;
}
