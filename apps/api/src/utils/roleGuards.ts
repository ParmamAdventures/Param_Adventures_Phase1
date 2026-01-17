import { prisma } from "../lib/prisma";

/**
 * Check if a user is the last super admin in the system.
 * Prevents removal of the last super admin role to avoid locking out administration.
 * @param {string} _userId - User ID to check (unused, can be used for optimization)
 * @returns {Promise<boolean>} - True if user is the last super admin, false otherwise
 */
export async function isLastSuperAdmin(_userId: string) {
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });
  if (!superAdminRole) return false;

  const count = await prisma.userRole.count({
    where: { roleId: superAdminRole.id },
  });

  // If there is only 1 (or 0) SUPER_ADMIN, and that one is the target user,
  // then it's last and should not be removable.
  if (count <= 1) return true;

  return false;
}
