import { PrismaClient  } from "@prisma/client";
(async () => {
  try {
    
    const prisma = new PrismaClient();
    const tripId = process.argv[2] || process.env.TRIP_ID;
    if (!tripId) {
      const count = await prisma.trip.count();
      console.log("Trip table exists, count:", count);
    } else {
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip) {
        console.log("NOT_FOUND");
      } else {
        console.log("FOUND");
        console.log(JSON.stringify(trip, null, 2));
      }
    }
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error("Trip check failed:", e && e.message ? e.message : e);
    process.exit(1);
  }
})();
