/**
 * Centralized Error Codes and Messages
 * 
 * This file contains all error codes used throughout the API for consistent error handling.
 * Each error code has an associated HTTP status, code string, and default message.
 */

export interface ErrorDefinition {
  status: number;
  code: string;
  message: string;
}

/**
 * Authentication & Authorization Errors (401, 403)
 */
export const AUTH_ERRORS = {
  UNAUTHORIZED: {
    status: 401,
    code: "UNAUTHORIZED",
    message: "Authentication required",
  },
  INVALID_CREDENTIALS: {
    status: 401,
    code: "INVALID_CREDENTIALS",
    message: "Invalid email or password",
  },
  TOKEN_EXPIRED: {
    status: 401,
    code: "TOKEN_EXPIRED",
    message: "Authentication token has expired",
  },
  INVALID_TOKEN: {
    status: 401,
    code: "INVALID_TOKEN",
    message: "Invalid authentication token",
  },
  FORBIDDEN: {
    status: 403,
    code: "FORBIDDEN",
    message: "You do not have permission to perform this action",
  },
  INSUFFICIENT_PERMISSIONS: {
    status: 403,
    code: "INSUFFICIENT_PERMISSIONS",
    message: "Insufficient permissions",
  },
} as const;

/**
 * Validation Errors (400)
 */
export const VALIDATION_ERRORS = {
  INVALID_REQUEST: {
    status: 400,
    code: "INVALID_REQUEST",
    message: "Invalid request data",
  },
  MISSING_REQUIRED_FIELD: {
    status: 400,
    code: "MISSING_REQUIRED_FIELD",
    message: "Required field is missing",
  },
  INVALID_EMAIL: {
    status: 400,
    code: "INVALID_EMAIL",
    message: "Invalid email format",
  },
  INVALID_PASSWORD: {
    status: 400,
    code: "INVALID_PASSWORD",
    message: "Password does not meet requirements",
  },
  INVALID_FORMAT: {
    status: 400,
    code: "INVALID_FORMAT",
    message: "Invalid data format",
  },
  INVALID_DATE: {
    status: 400,
    code: "INVALID_DATE",
    message: "Invalid date format",
  },
  INVALID_UUID: {
    status: 400,
    code: "INVALID_UUID",
    message: "Invalid ID format",
  },
} as const;

/**
 * Resource Errors (404, 409)
 */
export const RESOURCE_ERRORS = {
  NOT_FOUND: {
    status: 404,
    code: "NOT_FOUND",
    message: "Resource not found",
  },
  USER_NOT_FOUND: {
    status: 404,
    code: "USER_NOT_FOUND",
    message: "User not found",
  },
  TRIP_NOT_FOUND: {
    status: 404,
    code: "TRIP_NOT_FOUND",
    message: "Trip not found",
  },
  BOOKING_NOT_FOUND: {
    status: 404,
    code: "BOOKING_NOT_FOUND",
    message: "Booking not found",
  },
  BLOG_NOT_FOUND: {
    status: 404,
    code: "BLOG_NOT_FOUND",
    message: "Blog not found",
  },
  REVIEW_NOT_FOUND: {
    status: 404,
    code: "REVIEW_NOT_FOUND",
    message: "Review not found",
  },
  MEDIA_NOT_FOUND: {
    status: 404,
    code: "MEDIA_NOT_FOUND",
    message: "Media not found",
  },
  ALREADY_EXISTS: {
    status: 409,
    code: "ALREADY_EXISTS",
    message: "Resource already exists",
  },
  EMAIL_ALREADY_EXISTS: {
    status: 409,
    code: "EMAIL_ALREADY_EXISTS",
    message: "Email already registered",
  },
  DUPLICATE_ENTRY: {
    status: 409,
    code: "DUPLICATE_ENTRY",
    message: "Duplicate entry detected",
  },
} as const;

/**
 * Business Logic Errors (400)
 */
export const BUSINESS_ERRORS = {
  TRIP_NOT_AVAILABLE: {
    status: 400,
    code: "TRIP_NOT_AVAILABLE",
    message: "Trip is not available for booking",
  },
  INSUFFICIENT_CAPACITY: {
    status: 400,
    code: "INSUFFICIENT_CAPACITY",
    message: "Not enough capacity available",
  },
  BOOKING_NOT_ELIGIBLE: {
    status: 400,
    code: "BOOKING_NOT_ELIGIBLE",
    message: "You are not eligible to perform this action on this booking",
  },
  TRIP_NOT_COMPLETED: {
    status: 400,
    code: "TRIP_NOT_COMPLETED",
    message: "Trip must be completed before this action",
  },
  ALREADY_REVIEWED: {
    status: 409,
    code: "ALREADY_REVIEWED",
    message: "You have already reviewed this trip",
  },
  INVALID_STATUS_TRANSITION: {
    status: 400,
    code: "INVALID_STATUS_TRANSITION",
    message: "Invalid status transition",
  },
  BOOKING_ALREADY_CANCELLED: {
    status: 400,
    code: "BOOKING_ALREADY_CANCELLED",
    message: "Booking is already cancelled",
  },
  PAST_CANCELLATION_DEADLINE: {
    status: 400,
    code: "PAST_CANCELLATION_DEADLINE",
    message: "Cancellation deadline has passed",
  },
} as const;

/**
 * Payment Errors (400, 402)
 */
export const PAYMENT_ERRORS = {
  PAYMENT_REQUIRED: {
    status: 402,
    code: "PAYMENT_REQUIRED",
    message: "Payment required",
  },
  PAYMENT_FAILED: {
    status: 400,
    code: "PAYMENT_FAILED",
    message: "Payment processing failed",
  },
  INVALID_PAYMENT_METHOD: {
    status: 400,
    code: "INVALID_PAYMENT_METHOD",
    message: "Invalid payment method",
  },
  REFUND_FAILED: {
    status: 400,
    code: "REFUND_FAILED",
    message: "Refund processing failed",
  },
  ALREADY_PAID: {
    status: 400,
    code: "ALREADY_PAID",
    message: "Booking is already paid",
  },
} as const;

/**
 * File/Media Errors (400, 413)
 */
export const MEDIA_ERRORS = {
  NO_FILE: {
    status: 400,
    code: "NO_FILE",
    message: "No file uploaded",
  },
  INVALID_FILE_TYPE: {
    status: 400,
    code: "INVALID_FILE_TYPE",
    message: "Invalid file type",
  },
  FILE_TOO_LARGE: {
    status: 413,
    code: "FILE_TOO_LARGE",
    message: "File size exceeds limit",
  },
  UPLOAD_FAILED: {
    status: 500,
    code: "UPLOAD_FAILED",
    message: "File upload failed",
  },
  MEDIA_IN_USE: {
    status: 400,
    code: "MEDIA_IN_USE",
    message: "Cannot delete media because it is being used by other records",
  },
} as const;

/**
 * Rate Limiting Errors (429)
 */
export const RATE_LIMIT_ERRORS = {
  TOO_MANY_REQUESTS: {
    status: 429,
    code: "TOO_MANY_REQUESTS",
    message: "Too many requests. Please try again later.",
  },
  RATE_LIMIT_EXCEEDED: {
    status: 429,
    code: "RATE_LIMIT_EXCEEDED",
    message: "Rate limit exceeded",
  },
} as const;

/**
 * Server Errors (500)
 */
export const SERVER_ERRORS = {
  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  },
  DATABASE_ERROR: {
    status: 500,
    code: "DATABASE_ERROR",
    message: "Database operation failed",
  },
  EXTERNAL_SERVICE_ERROR: {
    status: 500,
    code: "EXTERNAL_SERVICE_ERROR",
    message: "External service error",
  },
} as const;

/**
 * Combined error codes object for easy access
 */
export const ERROR_CODES = {
  ...AUTH_ERRORS,
  ...VALIDATION_ERRORS,
  ...RESOURCE_ERRORS,
  ...BUSINESS_ERRORS,
  ...PAYMENT_ERRORS,
  ...MEDIA_ERRORS,
  ...RATE_LIMIT_ERRORS,
  ...SERVER_ERRORS,
} as const;

/**
 * Helper function to create an error with predefined code
 */
export function createError(errorDef: ErrorDefinition, customMessage?: string) {
  return {
    status: errorDef.status,
    code: errorDef.code,
    message: customMessage || errorDef.message,
  };
}

/**
 * Type for all error codes
 */
export type ErrorCode = keyof typeof ERROR_CODES;
