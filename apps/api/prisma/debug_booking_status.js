
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- Debugging Trip & Booking Status ---");

  // 1. Find the Everest Trip
  const trip = await prisma.trip.findFirst({
    where: { title: { contains: 'Everest' } },
    include: { bookings: true }
  });

  if (!trip) {
    console.log("Trip not found!");
    return;
  }

  console.log(`Trip: ${trip.title} (ID: ${trip.id})`);
  console.log(`Status: ${trip.status}`);

  // 2. Check Bookings
  console.log(`\nFound ${trip.bookings.length} Bookings:`);
  trip.bookings.forEach(b => {
    console.log(` - Booking ID: ${b.id}`);
    console.log(`   User ID: ${b.userId}`);
    console.log(`   Status: ${b.status}`);
    console.log(`   Payment: ${b.paymentStatus}`);
  });

}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
