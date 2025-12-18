(async () => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const count = await prisma.trip.count();
    console.log("Trip table exists, count:", count);
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error("Trip check failed:", e && e.message ? e.message : e);
    process.exit(1);
  }
})();
