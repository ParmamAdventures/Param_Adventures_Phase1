const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkData() {
  try {
    const tripCount = await prisma.trip.count();
    const blogCount = await prisma.blog.count();
    const bookingCount = await prisma.booking.count();
    const userCount = await prisma.user.count();

    console.log("\n📊 Database Data Check:");
    console.log("=".repeat(40));
    console.log(`✅ Trips: ${tripCount}`);
    console.log(`✅ Blogs: ${blogCount}`);
    console.log(`✅ Bookings: ${bookingCount}`);
    console.log(`✅ Users: ${userCount}`);
    console.log("=".repeat(40));

    if (tripCount === 0) {
      console.log("\n❌ No trips found! Run seed script:");
      console.log("   npx tsx prisma/seed_comprehensive.js");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
