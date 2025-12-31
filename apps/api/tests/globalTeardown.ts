import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function globalTeardown() {
  console.log("\nRunning global teardown...");
  try {
    // Clean up all tables in safe order
    await prisma.payment?.deleteMany();
    await prisma.booking?.deleteMany();
    await prisma.tripGalleryImage?.deleteMany();
    await prisma.blog?.deleteMany();
    await prisma.trip?.deleteMany();
    await prisma.image?.deleteMany();

    await prisma.rolePermission?.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.userRole?.deleteMany();
    await prisma.user.deleteMany();

    console.log("Global teardown complete: Database cleaned.");
  } catch (error) {
    console.error("Global teardown failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}
