import { TripStatus, BlogStatus, BookingStatus } from "@prisma/client";
import { HttpError } from "./httpError";

/**
 * Status transition validation utilities
 * Implements state machine logic to prevent invalid status transitions
 */

/**
 * Valid trip status transitions
 * Defines allowed state changes for trip workflow
 */
const TRIP_STATUS_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  DRAFT: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["APPROVED", "DRAFT"], // Can go back to draft for edits
  APPROVED: ["PUBLISHED", "DRAFT"], // Admin can send back to draft
  PUBLISHED: ["IN_PROGRESS", "ARCHIVED"],
  IN_PROGRESS: ["COMPLETED", "ARCHIVED"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT", "PUBLISHED"], // Can restore archived trips
};

/**
 * Valid blog status transitions
 */
const BLOG_STATUS_TRANSITIONS: Record<BlogStatus, BlogStatus[]> = {
  DRAFT: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["APPROVED", "REJECTED", "DRAFT"],
  APPROVED: ["PUBLISHED", "DRAFT"],
  PUBLISHED: [], // Cannot change once published
  REJECTED: ["DRAFT"], // Can edit and resubmit
};

/**
 * Valid booking status transitions
 */
const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: ["CONFIRMED", "CANCELLED", "REJECTED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  CANCELLED: [], // Terminal state
  REJECTED: [], // Terminal state
  COMPLETED: [], // Terminal state
};

/**
 * Validates trip status transition
 * @throws HttpError if transition is invalid
 */
export function validateTripStatusTransition(
  currentStatus: TripStatus,
  newStatus: TripStatus
): void {
  // Allow staying in same status
  if (currentStatus === newStatus) {
    return;
  }

  const allowedTransitions = TRIP_STATUS_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    throw new HttpError(
      400,
      "INVALID_STATUS_TRANSITION",
      `Cannot transition trip from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(", ")}`
    );
  }
}

/**
 * Validates blog status transition
 * @throws HttpError if transition is invalid
 */
export function validateBlogStatusTransition(
  currentStatus: BlogStatus,
  newStatus: BlogStatus
): void {
  // Allow staying in same status
  if (currentStatus === newStatus) {
    return;
  }

  const allowedTransitions = BLOG_STATUS_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    throw new HttpError(
      400,
      "INVALID_STATUS_TRANSITION",
      `Cannot transition blog from ${currentStatus} to ${newStatus}. ${
        allowedTransitions.length > 0
          ? `Allowed transitions: ${allowedTransitions.join(", ")}`
          : "No transitions allowed from this state"
      }`
    );
  }
}

/**
 * Validates booking status transition
 * @throws HttpError if transition is invalid
 */
export function validateBookingStatusTransition(
  currentStatus: BookingStatus,
  newStatus: BookingStatus
): void {
  // Allow staying in same status
  if (currentStatus === newStatus) {
    return;
  }

  const allowedTransitions = BOOKING_STATUS_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    throw new HttpError(
      400,
      "INVALID_STATUS_TRANSITION",
      `Cannot transition booking from ${currentStatus} to ${newStatus}. ${
        allowedTransitions.length > 0
          ? `Allowed transitions: ${allowedTransitions.join(", ")}`
          : "This is a terminal state"
      }`
    );
  }
}

/**
 * Checks if a trip status transition is valid (non-throwing version)
 */
export function isTripStatusTransitionValid(
  currentStatus: TripStatus,
  newStatus: TripStatus
): boolean {
  if (currentStatus === newStatus) return true;
  return TRIP_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

/**
 * Checks if a blog status transition is valid (non-throwing version)
 */
export function isBlogStatusTransitionValid(
  currentStatus: BlogStatus,
  newStatus: BlogStatus
): boolean {
  if (currentStatus === newStatus) return true;
  return BLOG_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

/**
 * Checks if a booking status transition is valid (non-throwing version)
 */
export function isBookingStatusTransitionValid(
  currentStatus: BookingStatus,
  newStatus: BookingStatus
): boolean {
  if (currentStatus === newStatus) return true;
  return BOOKING_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

/**
 * Gets allowed status transitions for a trip
 */
export function getAllowedTripTransitions(currentStatus: TripStatus): TripStatus[] {
  return TRIP_STATUS_TRANSITIONS[currentStatus];
}

/**
 * Gets allowed status transitions for a blog
 */
export function getAllowedBlogTransitions(currentStatus: BlogStatus): BlogStatus[] {
  return BLOG_STATUS_TRANSITIONS[currentStatus];
}

/**
 * Gets allowed status transitions for a booking
 */
export function getAllowedBookingTransitions(currentStatus: BookingStatus): BookingStatus[] {
  return BOOKING_STATUS_TRANSITIONS[currentStatus];
}
