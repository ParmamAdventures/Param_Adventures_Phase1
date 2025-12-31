import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

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
        console.error(
          "Validation Error Details:",
          JSON.stringify(error.flatten().fieldErrors, null, 2),
        );
        return res.status(400).json({
          error: "Validation failed",
          details: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  };
