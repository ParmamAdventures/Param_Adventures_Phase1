import { Request, Response, NextFunction } from "express";
import { HttpError } from "../lib/httpError";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof HttpError) {
    return res
      .status(err.status)
      .json({ error: { code: err.code, message: err.message } });
  }

  res
    .status(500)
    .json({
      error: { code: "INTERNAL_ERROR", message: "Internal Server Error" },
    });
}
