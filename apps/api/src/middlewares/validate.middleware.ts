import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../lib/logger";

/**
 * Factory function to create request validation middleware using Zod.
 * Validates request body, query parameters, and route params against provided schema.
 * Returns 400 with validation details on failure, otherwise calls next().
 * @param {ZodSchema} schema - Zod schema for request validation
 * @returns {Function} - Express middleware function
 */
export const validate =
  (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.flatten().fieldErrors;
        logger.warn("Validation failed", { details });
        return res.status(400).json({
          error: "Validation failed",
          details,
        });
      }
      next(error as Error);
    }
  };
