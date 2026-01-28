/**
 * Permission Helper Utilities
 * Consolidated permission checking logic to eliminate duplication across controllers
 */

import { Response } from "express";
import { ApiResponse } from "./ApiResponse";

export type ResourceType = "blog" | "trip" | "booking" | "review" | "user";

interface UserWithPermissions {
  id: string;
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * Checks if user has ownership of a resource or has the required permission
 * @param entity - The entity to check ownership for
 * @param userId - The user ID making the request
 * @param user - The authenticated user object with permissions
 * @param resourceType - Type of resource (blog, trip, etc.)
 * @returns Object with ownership status and authorization result
 */
export function checkEntityOwnership(
  entity: Record<string, unknown>,
  userId: string,
  user: UserWithPermissions,
  resourceType: ResourceType,
): {
  isOwner: boolean;
  hasPermission: boolean;
  authorized: boolean;
} {
  // Determine the owner field based on resource type
  const ownerFieldMap: Record<ResourceType, string> = {
    blog: "authorId",
    trip: "createdById",
    booking: "userId",
    review: "userId",
    user: "id",
  };

  const ownerField = ownerFieldMap[resourceType] || "userId";
  const permissionKey = `${resourceType}:edit`;

  // Check if user is the owner
  const isOwner = entity[ownerField] === userId;

  // Check if user has the required permission
  const hasPermission =
    user.permissions?.includes(permissionKey) ||
    user.permissions?.includes(`${resourceType}:*`) ||
    user.permissions?.includes("*") ||
    false;

  // User is authorized if they're the owner OR have the permission
  const authorized = isOwner || hasPermission;

  return { isOwner, hasPermission, authorized };
}

/**
 * Middleware-like function to check authorization and return error if unauthorized
 * @param entity - The entity to check
 * @param userId - The user ID
 * @param user - The user object
 * @param resourceType - Resource type
 * @param res - Express response object
 * @returns true if authorized, false if not (and sends error response)
 */
export function requireEntityAuthorization(
  entity: Record<string, unknown>,
  userId: string,
  user: UserWithPermissions,
  resourceType: ResourceType,
  res: Response,
): boolean {
  const { authorized } = checkEntityOwnership(entity, userId, user, resourceType);

  if (!authorized) {
    ApiResponse.error(
      res,
      "FORBIDDEN",
      `You don't have permission to modify this ${resourceType}`,
      403,
    );
    return false;
  }

  return true;
}

/**
 * Check if user has any of the specified permissions
 * @param user - User object with permissions array
 * @param permissions - Array of permission strings to check
 * @returns true if user has at least one of the permissions
 */
export function hasAnyPermission(user: UserWithPermissions, permissions: string[]): boolean {
  if (!user?.permissions || !Array.isArray(user.permissions)) {
    return false;
  }

  // Check for wildcard permission
  if (user.permissions.includes("*")) {
    return true;
  }

  // Check if user has any of the specified permissions
  return permissions.some(
    (permission) =>
      user.permissions?.includes(permission) ||
      user.permissions?.includes(permission.split(":")[0] + ":*"),
  );
}

/**
 * Check if user has all of the specified permissions
 * @param user - User object with permissions array
 * @param permissions - Array of permission strings to check
 * @returns true if user has all of the permissions
 */
export function hasAllPermissions(user: UserWithPermissions, permissions: string[]): boolean {
  if (!user?.permissions || !Array.isArray(user.permissions)) {
    return false;
  }

  // Wildcard grants all permissions
  if (user.permissions.includes("*")) {
    return true;
  }

  // Check if user has all specified permissions
  return permissions.every(
    (permission) =>
      user.permissions?.includes(permission) ||
      user.permissions?.includes(permission.split(":")[0] + ":*"),
  );
}
