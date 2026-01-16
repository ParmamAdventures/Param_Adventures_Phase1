import { PrismaClient  } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Reviews...");

  // 1. Fetch Users and Trips
  const users = await prisma.user.findMany({ take: 5 });
  const trips = await prisma.trip.findMany({ take: 5 });

  if (users.length === 0 || trips.length === 0) {
    console.error("Not enough users or trips to seed reviews.");
    process.exit(1);
  }

  const reviewsData = [
    {
      comment: "Absolutely breathtaking experience! The guides were so supportive.",
      rating: 5,
    },
    {
      comment: "A bit challenging but worth every step. The view from the summit is unreal.",
      rating: 4,
    },
    {
      comment: "Highly recommended for adventure lovers. Well organized.",
      rating: 5,
    },
    {
      comment: "Great food, great company, and an unforgettable journey.",
      rating: 5,
    }
  ];

  for (const review of reviewsData) {
    // Pick random user and trip
    const user = users[Math.floor(Math.random() * users.length)];
    const trip = trips[Math.floor(Math.random() * trips.length)];

    console.log(`Creating review for Trip: ${trip.title} by User: ${user.name}`);

    // 2. Ensure Completed Booking exists (Prerequisite)
    const existingBooking = await prisma.booking.findFirst({
      where: { userId: user.id, tripId: trip.id }
    });

    if (!existingBooking) {
      await prisma.booking.create({
        data: {
          userId: user.id,
          tripId: trip.id,
          startDate: new Date(),
          guests: 1,
          totalPrice: trip.price,
          status: "COMPLETED", // Crucial for allowing review
          paymentStatus: "PAID"
        }
      });
      console.log(" -> Created prerequisite COMPLETED booking.");
    } else {
        // Update to completed if not
        if (existingBooking.status !== "COMPLETED") {
             await prisma.booking.update({
                 where: { id: existingBooking.id },
                 data: { status: "COMPLETED" }
             });
             console.log(" -> Updated booking to COMPLETED.");
        }
    }

    // 3. Create Review
    try {
        await prisma.review.create({
            data: {
                userId: user.id,
                tripId: trip.id,
                rating: review.rating,
                comment: review.comment
            }
        });
        console.log(" -> Review created successfully!");
    } catch (e) {
        if (e.code === 'P2002') {
            console.log(" -> Review already exists. Skipping.");
        } else {
            console.error(" -> Failed to create review:", e.message);
        }
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
