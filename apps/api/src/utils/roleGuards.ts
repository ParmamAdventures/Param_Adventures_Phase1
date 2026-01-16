import { prisma } from "../lib/prisma";

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
