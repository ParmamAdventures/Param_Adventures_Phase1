/**
 * Centralized error codes and messages
 * Prevents hardcoded strings across 50+ files
 * Makes error messages consistent and i18n-ready
 */

export const ErrorCodes = {
  // Generic
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  BAD_REQUEST: "BAD_REQUEST",

  // Trip errors
  TRIP_NOT_FOUND: "TRIP_NOT_FOUND",
  TRIP_ALREADY_PUBLISHED: "TRIP_ALREADY_PUBLISHED",
  TRIP_INVALID_STATUS: "TRIP_INVALID_STATUS",
  TRIP_CAPACITY_EXCEEDED: "TRIP_CAPACITY_EXCEEDED",
  TRIP_EDIT_FORBIDDEN: "TRIP_EDIT_FORBIDDEN",
  TRIP_EDIT_NOT_DRAFT: "TRIP_EDIT_NOT_DRAFT",
  TRIP_ARCHIVE_INVALID_STATE: "TRIP_ARCHIVE_INVALID_STATE",
  TRIP_DELETE_HAS_BOOKINGS: "TRIP_DELETE_HAS_BOOKINGS",

  // Blog errors
  BLOG_NOT_FOUND: "BLOG_NOT_FOUND",
  BLOG_ALREADY_PUBLISHED: "BLOG_ALREADY_PUBLISHED",
  BLOG_INVALID_STATUS: "BLOG_INVALID_STATUS",
  BLOG_NOT_DRAFT: "BLOG_NOT_DRAFT",
  BLOG_EDIT_FORBIDDEN: "BLOG_EDIT_FORBIDDEN",

  // Booking errors
  BOOKING_NOT_FOUND: "BOOKING_NOT_FOUND",
  BOOKING_ALREADY_CONFIRMED: "BOOKING_ALREADY_CONFIRMED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  BOOKING_INVALID_STATUS: "BOOKING_INVALID_STATUS",
  INSUFFICIENT_CAPACITY: "INSUFFICIENT_CAPACITY",
  BOOKING_DATE_PAST: "BOOKING_DATE_PAST",
  BOOKING_DUPLICATE: "BOOKING_DUPLICATE",

  // User errors
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_BANNED: "USER_BANNED",
  WEAK_PASSWORD: "WEAK_PASSWORD",

  // Payment errors
  PAYMENT_NOT_FOUND: "PAYMENT_NOT_FOUND",
  PAYMENT_ALREADY_PROCESSED: "PAYMENT_ALREADY_PROCESSED",
  PAYMENT_VERIFICATION_FAILED: "PAYMENT_VERIFICATION_FAILED",
  PAYMENT_AMOUNT_MISMATCH: "PAYMENT_AMOUNT_MISMATCH",
  REFUND_FAILED: "REFUND_FAILED",

  // Permission errors
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  INVALID_PERMISSION: "INVALID_PERMISSION",

  // Role errors
  ROLE_NOT_FOUND: "ROLE_NOT_FOUND",
  SYSTEM_ROLE_CANNOT_DELETE: "SYSTEM_ROLE_CANNOT_DELETE",
  ROLE_IN_USE: "ROLE_IN_USE",

  // Media errors
  UPLOAD_FAILED: "UPLOAD_FAILED",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",

  // Invalid state transitions
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
} as const;

export const ErrorMessages = {
  // Generic
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  VALIDATION_ERROR: "Validation failed",
  INTERNAL_ERROR: "Internal server error",
  BAD_REQUEST: "Bad request",

  // Trip
  TRIP_NOT_FOUND: "Trip not found",
  TRIP_ALREADY_PUBLISHED: "Trip is already published",
  TRIP_INVALID_STATUS: "Invalid trip status transition",
  TRIP_CAPACITY_EXCEEDED: "Trip capacity exceeded",
  TRIP_EDIT_FORBIDDEN: "Insufficient permissions to edit this trip",
  TRIP_EDIT_NOT_DRAFT: "Only drafts can be edited by owners",
  TRIP_ARCHIVE_INVALID_STATE: "Invalid state transition",
  TRIP_DELETE_HAS_BOOKINGS: "Cannot delete trip with existing bookings",

  // Blog
  BLOG_NOT_FOUND: "Blog not found",
  BLOG_ALREADY_PUBLISHED: "Blog is already published",
  BLOG_INVALID_STATUS: "Invalid blog status transition",
  BLOG_NOT_DRAFT: "Only draft blogs can be edited",
  BLOG_EDIT_FORBIDDEN: "Insufficient permissions to edit this blog",

  // Booking
  BOOKING_NOT_FOUND: "Booking not found",
  BOOKING_ALREADY_CONFIRMED: "Booking is already confirmed",
  BOOKING_CANCELLED: "Booking has been cancelled",
  BOOKING_INVALID_STATUS: "Invalid booking status",
  INSUFFICIENT_CAPACITY: "Insufficient capacity available",
  BOOKING_DATE_PAST: "Cannot book trips in the past",
  BOOKING_DUPLICATE: "You have already booked this trip for the selected date",

  // User
  USER_NOT_FOUND: "User not found",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_SUSPENDED: "Your account has been suspended",
  USER_BANNED: "Your account has been banned",
  WEAK_PASSWORD: "Password does not meet security requirements",

  // Payment
  PAYMENT_NOT_FOUND: "Payment not found",
  PAYMENT_ALREADY_PROCESSED: "Payment already processed",
  PAYMENT_VERIFICATION_FAILED: "Payment verification failed",
  PAYMENT_AMOUNT_MISMATCH: "Payment amount does not match booking",
  REFUND_FAILED: "Refund processing failed",

  // Permission
  INSUFFICIENT_PERMISSIONS: "You don't have permission to perform this action",
  PERMISSION_DENIED: "Permission denied",
  INVALID_PERMISSION: "Invalid permission",

  // Role
  ROLE_NOT_FOUND: "Role not found",
  SYSTEM_ROLE_CANNOT_DELETE: "System roles cannot be deleted",
  ROLE_IN_USE: "Cannot delete role that is assigned to users",

  // Media
  UPLOAD_FAILED: "File upload failed",
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_TOO_LARGE: "File size exceeds maximum allowed",

  // State transitions
  INVALID_STATUS_TRANSITION: "Invalid status transition",
} as const;

export type ErrorCode = keyof typeof ErrorCodes;
export type ErrorMessage = keyof typeof ErrorMessages;
