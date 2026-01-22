import { prisma } from "../src/lib/prisma"; // Import the existing prisma client

// Ensure DATABASE_URL is available for teardown even though Jest spawns a new process
const TEST_DB_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/param_adventures_test";
process.env.DATABASE_URL = TEST_DB_URL;

export default async function globalTeardown() {
  console.log("\nRunning global teardown...");
  try {
    // Temporarily commenting out database cleanup to diagnose PrismaClientConstructorValidationError
    /*
    await prisma.payment?.deleteMany();
    await prisma.booking?.deleteMany();
    await prisma.review?.deleteMany(); // Added
    await prisma.savedTrip?.deleteMany(); // Added
    await prisma.tripInquiry?.deleteMany(); // Added
    await prisma.newsletterSubscriber?.deleteMany(); // Added
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
    */
    console.log("Global teardown complete: Database cleanup temporarily skipped.");
  } catch (error) {
    console.error("Global teardown failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}
