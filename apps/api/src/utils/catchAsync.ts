import { Request, Response, NextFunction } from "express";

/**
 * Wrapper function for async route handlers.
 * Automatically catches any thrown errors and passes them to Express error handler.
 * Eliminates need for try-catch blocks in async route handlers.
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Express middleware that wraps the handler with error catching
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
