import "dotenv/config.js";
import { PrismaClient  } from "@prisma/client";


const prisma = new PrismaClient();

const bookingId = process.argv[2] || process.env.BOOKING_ID;

if (!bookingId) {
  console.error("Usage: node check_booking.js <bookingId> or set BOOKING_ID env var");
  process.exit(2);
}

async function run() {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      console.log("BOOKING_NOT_FOUND");
    } else {
      console.log("BOOKING:");
      console.log(JSON.stringify(booking, null, 2));
      if (booking.tripId) {
        const trip = await prisma.trip.findUnique({ where: { id: booking.tripId } });
        if (!trip) console.log("ASSOCIATED_TRIP_NOT_FOUND");
        else {
          console.log("ASSOCIATED_TRIP:");
          console.log(JSON.stringify(trip, null, 2));
        }
      }
    }
  } catch (e) {
    console.error("ERROR", e && e.message ? e.message : e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
