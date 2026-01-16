import { PrismaClient  } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const guideEmail = "guide@local.test";
  const tripSlug = "annapurna-circuit";

  // 1. Find Guide
  console.log(`Finding guide: ${guideEmail}`);
  const guide = await prisma.user.findUnique({ where: { email: guideEmail } });
  if (!guide) throw new Error("Guide not found");

  // 2a. Handle Image
  console.log("Ensuring cover image exists...");
  const admin = await prisma.user.findFirst({
    where: { roles: { some: { role: { name: "SUPER_ADMIN" } } } },
  }); // Need an uploader

  const coverImage = await prisma.image.create({
    data: {
      originalUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
      mediumUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
      thumbUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=200&q=80",
      width: 800,
      height: 600,
      size: 1024,
      mimeType: "image/jpeg",
      uploadedById: guide.id, // Guide can own it for simplicity, or admin
    },
  });

  const trip = await prisma.trip.update({
    where: { slug: tripSlug },
    data: {
      coverImageId: coverImage.id,
    },
  });

  if (!trip) throw new Error("Trip not found");

  // 3. Assign
  console.log("Assigning guide to trip...");
  await prisma.tripsOnGuides.upsert({
    where: {
      tripId_guideId: {
        tripId: trip.id,
        guideId: guide.id,
      },
    },
    update: {},
    create: {
      tripId: trip.id,
      guideId: guide.id,
    },
  });

  console.log("SUCCESS: Trip assigned to guide.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
