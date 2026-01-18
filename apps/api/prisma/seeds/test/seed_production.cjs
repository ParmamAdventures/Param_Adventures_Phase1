const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Clearing existing data...");

  // Delete all data
  try {
    await prisma.payment.deleteMany();
  } catch (e) {}
  try {
    await prisma.booking.deleteMany();
  } catch (e) {}
  try {
    await prisma.savedTrip.deleteMany();
  } catch (e) {}
  try {
    await prisma.review.deleteMany();
  } catch (e) {}
  try {
    await prisma.tripInquiry.deleteMany();
  } catch (e) {}
  try {
    await prisma.newsletterSubscriber.deleteMany();
  } catch (e) {}
  try {
    await prisma.heroSlide.deleteMany();
  } catch (e) {}
  try {
    await prisma.blog.deleteMany();
  } catch (e) {}
  try {
    await prisma.tripGalleryImage.deleteMany();
  } catch (e) {}
  try {
    await prisma.tripsOnGuides.deleteMany();
  } catch (e) {}
  try {
    await prisma.trip.deleteMany();
  } catch (e) {}
  try {
    await prisma.image.deleteMany();
  } catch (e) {}
  try {
    await prisma.userRole.deleteMany();
  } catch (e) {}
  try {
    await prisma.rolePermission.deleteMany();
  } catch (e) {}
  try {
    await prisma.permission.deleteMany();
  } catch (e) {}
  try {
    await prisma.role.deleteMany();
  } catch (e) {}
  try {
    await prisma.user.deleteMany();
  } catch (e) {}

  console.log("✅ Data cleared\n");

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  // 1. Roles
  const adminRole = await prisma.role.create({
    data: { name: "ADMIN", description: "Administrator" },
  });
  const userRole = await prisma.role.create({
    data: { name: "USER", description: "Regular user" },
  });

  // 2. Permissions
  const perms = ["trips:read", "trips:create", "bookings:read", "users:manage"];
  for (const key of perms) {
    const perm = await prisma.permission.create({ data: { key, description: key } });
    await prisma.rolePermission.create({
      data: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // 3. Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@paramadventures.com",
      password: hashedPassword,
      name: "Admin User",
      status: "ACTIVE",
    },
  });
  await prisma.userRole.create({
    data: { userId: admin.id, roleId: adminRole.id },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: "user@paramadventures.com",
      password: hashedPassword,
      name: "John Doe",
      phoneNumber: "+91-9876543210",
      status: "ACTIVE",
    },
  });
  await prisma.userRole.create({
    data: { userId: regularUser.id, roleId: userRole.id },
  });

  // 4. Images
  const img1 = await prisma.image.create({
    data: {
      originalUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      mediumUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      thumbUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      width: 1920,
      height: 1080,
      size: 245000,
      mimeType: "image/jpeg",
      type: "IMAGE",
      uploadedById: admin.id,
    },
  });

  const img2 = await prisma.image.create({
    data: {
      originalUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e",
      mediumUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800",
      thumbUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400",
      width: 1920,
      height: 1080,
      size: 235000,
      mimeType: "image/jpeg",
      type: "IMAGE",
      uploadedById: admin.id,
    },
  });

  // 5. Trips
  const trip1 = await prisma.trip.create({
    data: {
      title: "Manali Leh Bike Adventure",
      slug: "manali-leh-bike-adventure",
      description:
        "Experience riding through the highest motorable roads. 9-day adventure from Manali to Ladakh.",
      itinerary: {
        days: [
          { day: 1, title: "Manali Arrival", activities: ["Meet & Greet", "Bike allocation"] },
          { day: 2, title: "Rohtang Pass", activities: ["Cross Rohtang", "Reach Jispa"] },
        ],
      },
      durationDays: 9,
      difficulty: "MODERATE",
      location: "Himachal Pradesh",
      price: 45000,
      capacity: 12,
      category: "TREK",
      status: "PUBLISHED",
      highlights: ["Rohtang Pass", "Khardung La", "Pangong Lake"],
      inclusions: ["Accommodation", "Meals", "Bike rental"],
      exclusions: ["Personal expenses", "Fuel"],
      coverImageId: img1.id,
      createdById: admin.id,
      isFeatured: true,
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      title: "Kerala Backwaters Houseboat",
      slug: "kerala-backwaters-houseboat",
      description:
        "Cruise through serene backwaters in a traditional houseboat. 3-day peaceful experience.",
      itinerary: {
        days: [
          { day: 1, title: "Boarding", activities: ["Check-in at Alleppey"] },
          { day: 2, title: "Cruise", activities: ["Full day backwater cruise"] },
        ],
      },
      durationDays: 3,
      difficulty: "EASY",
      location: "Kerala",
      price: 18000,
      capacity: 8,
      category: "SPIRITUAL",
      status: "PUBLISHED",
      highlights: ["Traditional houseboat", "Kerala cuisine", "Sunset views"],
      inclusions: ["Houseboat stay", "All meals"],
      exclusions: ["Personal expenses", "Travel to Alleppey"],
      coverImageId: img2.id,
      createdById: admin.id,
      isFeatured: true,
    },
  });

  // 6. Blog
  const blogImg = await prisma.image.create({
    data: {
      originalUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800",
      mediumUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
      thumbUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400",
      width: 1920,
      height: 1080,
      size: 280000,
      mimeType: "image/jpeg",
      type: "IMAGE",
      uploadedById: admin.id,
    },
  });

  await prisma.blog.create({
    data: {
      title: "Tips for High Altitude Trekking",
      slug: "tips-high-altitude-trekking",
      excerpt: "Essential tips for safe high-altitude adventures.",
      content: "<h2>Acclimatization</h2><p>Give your body time to adjust.</p>",
      coverImageId: blogImg.id,
      authorId: admin.id,
      status: "PUBLISHED",
    },
  });

  // 7. Booking
  const booking = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      userId: regularUser.id,
      guests: 2,
      totalPrice: 90000,
      status: "CONFIRMED",
      startDate: new Date("2026-06-15"),
    },
  });

  // 8. Payment
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: "razorpay",
      providerOrderId: "order_" + Date.now(),
      providerPaymentId: "pay_" + Date.now(),
      amount: 90000,
      currency: "INR",
      status: "CAPTURED",
      method: "card",
    },
  });

  // 9. Review
  await prisma.review.create({
    data: {
      tripId: trip1.id,
      userId: regularUser.id,
      rating: 5,
      comment: "Amazing experience!",
    },
  });

  // 10. Saved Trip
  await prisma.savedTrip.create({
    data: {
      userId: regularUser.id,
      tripId: trip2.id,
    },
  });

  console.log("\n✅ ✨ Minimal production data created!\n");
  console.log("📊 Summary:");
  console.log("  • 2 Users (1 Admin, 1 User)");
  console.log("  • 2 Trips (both published)");
  console.log("  • 1 Blog post");
  console.log("  • 1 Booking (confirmed with payment)");
  console.log("  • 1 Review");
  console.log("  • 1 Saved trip\n");
  console.log("🔐 Credentials:");
  console.log("  Admin: admin@paramadventures.com / Admin@123");
  console.log("  User:  user@paramadventures.com / Admin@123\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
