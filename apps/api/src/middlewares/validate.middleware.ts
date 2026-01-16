import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../lib/logger";

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
