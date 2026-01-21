import { Request, Response, NextFunction } from "express";

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Middleware to parse pagination parameters from query string.
 * Defaults: page=1, limit=10
 */
export const paginate = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;

  // Cap limit to prevent massive queries
  const maxLimit = 100;
  const safeLimit = Math.min(limit, maxLimit);

  const skip = (page - 1) * safeLimit;

  req.pagination = {
    page,
    limit: safeLimit,
    skip,
  };

  next();
};
