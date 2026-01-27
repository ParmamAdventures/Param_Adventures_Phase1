import { Request, Response } from "express";
import { Prisma, UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { logReqAudit, AuditAction } from "../../utils/audit.helper";
import { ApiResponse } from "../../utils/ApiResponse";

/**
 * List Users
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function listUsers(req: Request, res: Response) {
  const { role } = req.query;

  const where: Prisma.UserWhereInput = {};

  if (role) {
    where.roles = {
      some: {
        role: {
          name: String(role),
        },
      },
    };
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      createdAt: true,
      avatarImage: {
        select: {
          thumbUrl: true,
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  const formattedUsers = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    status: u.status,
    roles: u.roles.map((r) => r.role.name),
    createdAt: u.createdAt,
    avatarImage: u.avatarImage,
  }));

  return ApiResponse.success(res, formattedUsers);
}

/**
 * Update User Status
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function updateUserStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
    return ApiResponse.badRequest(res, "Invalid status");
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      status: status as UserStatus,
      statusReason: reason,
    },
    select: {
      id: true,
      email: true,
      status: true,
    },
  });

  await logReqAudit(req, AuditAction.USER_STATUS_CHANGED, "USER", user.id, {
    status,
    reason,
  });

  return ApiResponse.updated(res, user, "User status updated successfully");
}

/**
 * Delete User
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  // Soft delete via status (Using BANNED as proxy for DELETE to avoid schema lock issues)
  const user = await prisma.user.update({
    where: { id },
    data: { status: "BANNED", statusReason: "DELETED_BY_ADMIN" },
  });

  await logReqAudit(req, AuditAction.USER_BANNED, "USER", user.id, {
    deletedAt: new Date().toISOString(),
  });

  return ApiResponse.deleted(res, "User deleted successfully");
}

/**
 * Unsuspend User
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function unsuspendUser(req: Request, res: Response) {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: { status: "ACTIVE", statusReason: null },
  });

  await logReqAudit(req, AuditAction.USER_STATUS_CHANGED, "USER", user.id, {
    status: "ACTIVE",
    action: "unsuspended",
  });

  return ApiResponse.updated(res, user, "User unsuspended successfully");
}
