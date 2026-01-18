const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Clearing existing data...");

  // Delete all data in correct order (respecting foreign keys)
  try {
    await prisma.auditLog.deleteMany();
  } catch (e) {}
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

  console.log("✅ All existing data cleared!");
  console.log("");
  console.log("🌱 Seeding minimal production data...");
  console.log("");

  // Hash password
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  // 1. Create Roles
  console.log("📝 Creating roles...");
  const adminRole = await prisma.role.create({
    data: { name: "ADMIN", description: "System administrator" },
  });
  const userRole = await prisma.role.create({
    data: { name: "USER", description: "Regular user" },
  });
  console.log("✅ Roles created");

  // 2. Create Permissions
  console.log("📝 Creating permissions...");
  const permissions = [
    { key: "trips:read", description: "View trips" },
    { key: "trips:create", description: "Create trips" },
    { key: "trips:update", description: "Update trips" },
    { key: "trips:delete", description: "Delete trips" },
    { key: "bookings:read", description: "View bookings" },
    { key: "bookings:manage", description: "Manage bookings" },
    { key: "users:manage", description: "Manage users" },
  ];

  for (const perm of permissions) {
    await prisma.permission.create({ data: perm });
  }
  console.log("✅ Permissions created");

  // 3. Assign permissions to roles
  console.log("📝 Assigning permissions...");
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.create({
      data: { roleId: adminRole.id, permissionId: perm.id },
    });
  }
  // Users can only read trips
  const readPerm = await prisma.permission.findFirst({ where: { key: "trips:read" } });
  await prisma.rolePermission.create({
    data: { roleId: userRole.id, permissionId: readPerm.id },
  });
  console.log("✅ Permissions assigned");

  // 4. Create Admin User
  console.log("📝 Creating admin user...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@paramadventures.com",
      password: hashedPassword,
      name: "Admin User",
      nickname: "Admin",
      status: "ACTIVE",
    },
  });
  await prisma.userRole.create({
    data: { userId: admin.id, roleId: adminRole.id },
  });
  console.log("✅ Admin user created");

  // 5. Create Regular User
  console.log("📝 Creating regular user...");
  const regularUser = await prisma.user.create({
    data: {
      email: "user@paramadventures.com",
      password: hashedPassword,
      name: "John Doe",
      nickname: "John",
      phoneNumber: "+91-9876543210",
      status: "ACTIVE",
    },
  });
  await prisma.userRole.create({
    data: { userId: regularUser.id, roleId: userRole.id },
  });
  console.log("✅ Regular user created");

  // 6. Create Images (Cover Images)
  console.log("📝 Creating images...");
  const tripCoverImages = [
    {
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
    {
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
    {
      originalUrl: "https://images.unsplash.com/photo-1506929562872-bb421503ef21",
      mediumUrl: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800",
      thumbUrl: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400",
      width: 1920,
      height: 1080,
      size: 255000,
      mimeType: "image/jpeg",
      type: "IMAGE",
      uploadedById: admin.id,
    },
  ];

  const createdMedia = [];
  for (const mediaData of tripCoverImages) {
    const media = await prisma.image.create({ data: mediaData });
    createdMedia.push(media);
  }
  console.log("✅ Images created");

  // 7. Create Trips
  console.log("📝 Creating trips...");
  const trip1 = await prisma.trip.create({
    data: {
      title: "Manali Leh Bike Adventure",
      slug: "manali-leh-bike-adventure",
      description:
        "Experience the thrill of riding through the highest motorable roads in the world. This 9-day adventure takes you from the lush valleys of Manali to the stark beauty of Ladakh.",
      itinerary: {
        days: [
          { day: 1, title: "Arrival in Manali", description: "Meet and greet, bike allocation" },
          { day: 2, title: "Manali to Jispa", description: "Ride through Rohtang Pass" },
          { day: 3, title: "Jispa to Leh", description: "Cross high altitude passes" },
        ],
      },
      durationDays: 9,
      difficulty: "MODERATE",
      location: "Himachal Pradesh, India",
      price: 45000,
      maxGroupSize: 12,
      minGroupSize: 6,
      category: "TREK",
      status: "PUBLISHED",
      highlights: ["Rohtang Pass", "Khardung La", "Pangong Lake", "Nubra Valley"],
      included: ["Accommodation", "Meals", "Bike rental", "Support vehicle"],
      excluded: ["Personal expenses", "Travel insurance", "Fuel costs"],
      cancellationPolicy:
        "Full refund if cancelled 30 days before. 50% refund if cancelled 15-30 days before.",
      bestTimeToVisit: "June to September",
      coverImageId: createdMedia[0].id,
      authorId: admin.id,
      isFeatured: true,
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      title: "Kerala Backwaters Houseboat Experience",
      slug: "kerala-backwaters-houseboat",
      description:
        "Cruise through the serene backwaters of Kerala in a traditional houseboat. Enjoy stunning sunsets, local cuisine, and the peaceful rhythm of life on the water.",
      itinerary: {
        days: [
          { day: 1, title: "Arrival & Boarding", description: "Check-in to houseboat in Alleppey" },
          { day: 2, title: "Backwater Cruise", description: "Full day cruising through canals" },
          { day: 3, title: "Departure", description: "Morning cruise and check-out" },
        ],
      },
      durationDays: 3,
      difficulty: "EASY",
      location: "Kerala, India",
      price: 18000,
      maxGroupSize: 8,
      minGroupSize: 2,
      category: "SPIRITUAL",
      status: "PUBLISHED",
      highlights: [
        "Traditional houseboat",
        "Authentic Kerala cuisine",
        "Sunset views",
        "Village visits",
      ],
      included: ["Houseboat accommodation", "All meals", "Crew services"],
      excluded: ["Personal expenses", "Alcohol", "Travel to Alleppey"],
      cancellationPolicy:
        "Full refund if cancelled 15 days before. 50% refund if cancelled 7-15 days before.",
      bestTimeToVisit: "October to March",
      coverImageId: createdMedia[1].id,
      authorId: admin.id,
      isFeatured: true,
    },
  });

  const trip3 = await prisma.trip.create({
    data: {
      title: "Rajasthan Desert Safari",
      slug: "rajasthan-desert-safari",
      description:
        "Explore the golden sands of Rajasthan on camelback. Visit ancient forts, experience desert camping under the stars, and immerse yourself in Rajasthani culture.",
      itinerary: {
        days: [
          { day: 1, title: "Jaisalmer Arrival", description: "Visit Jaisalmer Fort" },
          { day: 2, title: "Desert Safari", description: "Camel ride to desert camp" },
          { day: 3, title: "Cultural Experience", description: "Folk music and dance" },
          { day: 4, title: "Return", description: "Morning safari and departure" },
        ],
      },
      durationDays: 4,
      difficulty: "EASY",
      location: "Rajasthan, India",
      price: 22000,
      maxGroupSize: 15,
      minGroupSize: 4,
      category: "EDUCATIONAL",
      status: "PUBLISHED",
      highlights: [
        "Jaisalmer Fort",
        "Camel safari",
        "Desert camping",
        "Rajasthani cuisine",
        "Folk performances",
      ],
      included: ["Accommodation", "Meals", "Camel safari", "Cultural programs"],
      excluded: ["Personal expenses", "Travel to Jaisalmer", "Monument entry fees"],
      cancellationPolicy:
        "Full refund if cancelled 20 days before. 50% refund if cancelled 10-20 days before.",
      bestTimeToVisit: "November to February",
      coverImageId: createdMedia[2].id,
      authorId: admin.id,
      isFeatured: false,
    },
  });
  console.log("✅ Trips created");

  // 8. Create Blog Cover Image
  console.log("📝 Creating blog image...");
  const blogCover = await prisma.image.create({
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
  console.log("✅ Blog image created");

  // 9. Create Blog
  console.log("📝 Creating blog...");
  const blog = await prisma.blog.create({
    data: {
      title: "Essential Tips for High Altitude Trekking",
      slug: "essential-tips-high-altitude-trekking",
      excerpt:
        "Planning a high-altitude trek? Here are the essential tips you need to know for a safe and enjoyable adventure in the mountains.",
      content: `
        <h2>Preparing for High Altitude</h2>
        <p>High altitude trekking requires proper preparation and acclimatization. Here are our top tips:</p>
        
        <h3>1. Acclimatization is Key</h3>
        <p>Give your body time to adjust to lower oxygen levels. Ascend gradually and include rest days.</p>
        
        <h3>2. Stay Hydrated</h3>
        <p>Drink plenty of water to combat altitude sickness. Aim for 3-4 liters per day.</p>
        
        <h3>3. Pack Smart</h3>
        <p>Layered clothing, sun protection, and emergency supplies are essential.</p>
        
        <h3>4. Listen to Your Body</h3>
        <p>Recognize symptoms of altitude sickness and descend if necessary.</p>
        
        <p>Follow these tips for a successful high-altitude adventure!</p>
      `,
      coverImageId: blogCover.id,
      authorId: admin.id,
      status: "PUBLISHED",
      views: 0,
    },
  });
  console.log("✅ Blog created");

  // 10. Create a Booking
  console.log("📝 Creating sample booking...");
  const booking = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      userId: regularUser.id,
      numberOfPeople: 2,
      totalPrice: 90000,
      status: "CONFIRMED",
      travelDate: new Date("2026-06-15"),
      specialRequests: "Vegetarian meals preferred",
    },
  });
  console.log("✅ Booking created");

  // 11. Create Payment
  console.log("📝 Creating payment record...");
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId: regularUser.id,
      amount: 90000,
      currency: "INR",
      status: "SUCCESS",
      method: "RAZORPAY",
      razorpayOrderId: "order_demo_" + Date.now(),
      razorpayPaymentId: "pay_demo_" + Date.now(),
    },
  });
  console.log("✅ Payment created");

  // 12. Create Review
  console.log("📝 Creating review...");
  await prisma.review.create({
    data: {
      tripId: trip1.id,
      userId: regularUser.id,
      rating: 5,
      comment:
        "Amazing experience! The ride through Rohtang Pass was breathtaking. Highly recommended!",
      status: "APPROVED",
    },
  });
  console.log("✅ Review created");

  // 13. Create Saved Trip
  console.log("📝 Creating saved trip...");
  await prisma.savedTrip.create({
    data: {
      userId: regularUser.id,
      tripId: trip2.id,
    },
  });
  console.log("✅ Saved trip created");

  console.log("");
  console.log("✅ ✨ Minimal seed data created successfully!");
  console.log("");
  console.log("📊 Summary:");
  console.log("  - 2 Users (1 Admin, 1 Regular User)");
  console.log("  - 3 Trips (all published)");
  console.log("  - 1 Blog post");
  console.log("  - 1 Booking (confirmed)");
  console.log("  - 1 Payment (success)");
  console.log("  - 1 Review (approved)");
  console.log("  - 1 Saved trip");
  console.log("");
  console.log("🔐 Login Credentials:");
  console.log("  Admin: admin@paramadventures.com / Admin@123");
  console.log("  User:  user@paramadventures.com / Admin@123");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
