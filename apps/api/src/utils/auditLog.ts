import { prisma } from "../lib/prisma";

/**
 * Creates an audit log entry
 * Consolidates 14+ duplicate audit log creations across controllers
 */
export async function createAuditLog(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata || {},
    },
  });
}

/**
 * Type-safe audit log actions
 */
export const AuditActions = {
  // Trip actions
  TRIP_CREATED: "TRIP_CREATED",
  TRIP_UPDATED: "TRIP_UPDATED",
  TRIP_DELETED: "TRIP_DELETED",
  TRIP_SUBMITTED: "TRIP_SUBMITTED",
  TRIP_APPROVED: "TRIP_APPROVED",
  TRIP_PUBLISHED: "TRIP_PUBLISHED",
  TRIP_ARCHIVED: "TRIP_ARCHIVED",
  TRIP_RESTORED: "TRIP_RESTORED",
  TRIP_COMPLETED: "TRIP_COMPLETED",

  // Blog actions
  BLOG_CREATED: "BLOG_CREATED",
  BLOG_UPDATED: "BLOG_UPDATED",
  BLOG_SUBMITTED: "BLOG_SUBMITTED",
  BLOG_APPROVED: "BLOG_APPROVED",
  BLOG_REJECTED: "BLOG_REJECTED",
  BLOG_PUBLISHED: "BLOG_PUBLISHED",

  // Booking actions
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  BOOKING_REJECTED: "BOOKING_REJECTED",
  BOOKING_COMPLETED: "BOOKING_COMPLETED",

  // User actions
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_ROLE_ASSIGNED: "USER_ROLE_ASSIGNED",
  USER_ROLE_REVOKED: "USER_ROLE_REVOKED",
  USER_STATUS_CHANGED: "USER_STATUS_CHANGED",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_BANNED: "USER_BANNED",

  // Role actions
  ROLE_CREATED: "ROLE_CREATED",
  ROLE_UPDATED: "ROLE_UPDATED",
  ROLE_DELETED: "ROLE_DELETED",
  ROLE_PERMISSION_ADDED: "ROLE_PERMISSION_ADDED",
  ROLE_PERMISSION_REMOVED: "ROLE_PERMISSION_REMOVED",

  // Payment actions
  PAYMENT_CREATED: "PAYMENT_CREATED",
  PAYMENT_CAPTURED: "PAYMENT_CAPTURED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_REFUNDED: "PAYMENT_REFUNDED",
  PAYMENT_DISPUTED: "PAYMENT_DISPUTED",
} as const;

/**
 * Type-safe target types
 */
export const AuditTargetTypes = {
  TRIP: "TRIP",
  BLOG: "BLOG",
  BOOKING: "BOOKING",
  USER: "USER",
  PAYMENT: "PAYMENT",
  ROLE: "ROLE",
  PERMISSION: "PERMISSION",
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];
export type AuditTargetType = (typeof AuditTargetTypes)[keyof typeof AuditTargetTypes];
