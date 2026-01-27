import { PrismaClient } from "@prisma/client";

export async function resetDb(prisma: PrismaClient) {
  const safeDelete = async (entity: string, deleteFn: () => Promise<unknown>) => {
    try {
      await deleteFn();
    } catch (e: unknown) {
      console.error(`Error clearing ${entity}:`, (e as Error).message);
    }
  };

  await safeDelete("payment", () => prisma.payment?.deleteMany());
  await safeDelete("booking", () => prisma.booking?.deleteMany());
  await safeDelete("blog", () => prisma.blog?.deleteMany());
  await safeDelete("trip", () => prisma.trip?.deleteMany());
  await safeDelete("savedTrip", () => prisma.savedTrip?.deleteMany());
  await safeDelete("review", () => prisma.review?.deleteMany());
  await safeDelete("image", () => prisma.image?.deleteMany());
  await safeDelete("auditLog", () => prisma.auditLog?.deleteMany());
  await safeDelete("userRole", () => prisma.userRole?.deleteMany());
  await safeDelete("rolePermission", () => prisma.rolePermission?.deleteMany());
  await safeDelete("permission", () => prisma.permission?.deleteMany());
  await safeDelete("role", () => prisma.role?.deleteMany());
  await safeDelete("user", () => prisma.user?.deleteMany());
}
