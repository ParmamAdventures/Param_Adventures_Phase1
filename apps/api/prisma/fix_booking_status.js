
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- FORCE FIX: Booking Status ---");

  // 1. Find the Everest Trip
  const trip = await prisma.trip.findFirst({
    where: { title: { contains: 'Everest' } },
    include: { bookings: true }
  });

  if (!trip) {
    console.log("Trip not found!");
    return;
  }

  console.log(`Trip: ${trip.title}`);
  console.log(`Trip Status: ${trip.status}`);

  // 2. Update Bookings
  const updateRes = await prisma.booking.updateMany({
      where: {
          tripId: trip.id,
          // Update: Just force update all CONFIRMED ones, ignore other filters for now to be safe
          status: 'CONFIRMED'
      },
      data: {
          status: 'COMPLETED'
      }
  });

  console.log(`Updated ${updateRes.count} bookings to COMPLETED.`);

  // 3. Verify
  const updatedTrip = await prisma.trip.findUnique({
      where: { id: trip.id },
      include: { bookings: true }
  });

  updatedTrip.bookings.forEach(b => {
      console.log(` - Booking ${b.id}: ${b.status}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
