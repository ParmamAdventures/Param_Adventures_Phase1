import { Response } from "express";

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Standardized API Response Helper
 * Provides consistent response format across all endpoints
 */
export class ApiResponse {
  /**
   * Send a success response
   */
  static success(res: Response, data: unknown, message?: string, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      ...(message && { message }),
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 500,
    details?: unknown,
  ) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send a paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
  ) {
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      ...(message && { message }),
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send a created (201) response
   */
  static created<T>(res: Response, data: T, message?: string) {
    return this.success(res, data, message || "Resource created successfully", 201);
  }

  /**
   * Send a no content (204) response
   */
  static noContent(res: Response) {
    return res.status(204).send();
  }

  /**
   * Send a deleted response
   */
  static deleted(res: Response, message?: string) {
    return this.success(res, { deleted: true }, message || "Resource deleted successfully");
  }

  /**
   * Send an updated response
   */
  static updated<T>(res: Response, data: T, message?: string) {
    return this.success(res, data, message || "Resource updated successfully");
  }

  /**
   * Send a bad request (400) error
   */
  static badRequest(res: Response, message: string, details?: unknown) {
    return this.error(res, "BAD_REQUEST", message, 400, details);
  }

  /**
   * Send an unauthorized (401) error
   */
  static unauthorized(res: Response, message: string = "Unauthorized") {
    return this.error(res, "UNAUTHORIZED", message, 401);
  }

  /**
   * Send a forbidden (403) error
   */
  static forbidden(res: Response, message: string = "Forbidden") {
    return this.error(res, "FORBIDDEN", message, 403);
  }

  /**
   * Send a not found (404) error
   */
  static notFound(res: Response, message: string = "Resource not found") {
    return this.error(res, "NOT_FOUND", message, 404);
  }

  /**
   * Send a conflict (409) error
   */
  static conflict(res: Response, message: string, details?: unknown) {
    return this.error(res, "CONFLICT", message, 409, details);
  }

  /**
   * Send an internal server error (500)
   */
  static serverError(res: Response, message: string = "Internal server error", details?: unknown) {
    return this.error(res, "INTERNAL_SERVER_ERROR", message, 500, details);
  }
}
