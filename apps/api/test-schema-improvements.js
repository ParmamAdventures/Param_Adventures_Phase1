/**
 * Schema Improvements Test Script
 * Tests all the improvements we made to the Prisma schema
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  log: ["query"], // Log queries to see if indexes are being used
});

async function testEnumConversion() {
  console.log("\n🧪 Test 1: TripInquiry Status Enum");
  console.log("=" .repeat(60));
  
  try {
    // Test valid enum value
    const inquiry = await prisma.tripInquiry.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        destination: "Manali",
        status: "NEW", // Should work with enum
      },
    });
    console.log("✅ Created inquiry with status:", inquiry.status);
    
    // Update to another valid status
    const updated = await prisma.tripInquiry.update({
      where: { id: inquiry.id },
      data: { status: "CONTACTED" },
    });
    console.log("✅ Updated status to:", updated.status);
    
    // Clean up
    await prisma.tripInquiry.delete({ where: { id: inquiry.id } });
    console.log("✅ Enum conversion works correctly!");
    
  } catch (error) {
    console.error("❌ Enum test failed:", error.message);
  }
}

async function testUniqueConstraint() {
  console.log("\n🧪 Test 2: Unique Booking Constraint");
  console.log("=".repeat(60));
  
  try {
    // Get or create a test user and trip
    const user = await prisma.user.findFirst();
    const trip = await prisma.trip.findFirst();
    
    if (!user || !trip) {
      console.log("⚠️  Skipping: Need at least one user and one trip in database");
      return;
    }
    
    const startDate = new Date("2026-06-01");
    
    // Create first booking
    const booking1 = await prisma.booking.create({
      data: {
        userId: user.id,
        tripId: trip.id,
        startDate,
        guests: 2,
        totalPrice: 50000,
      },
    });
    console.log("✅ Created first booking:", booking1.id);
    
    // Try to create duplicate - should fail
    try {
      await prisma.booking.create({
        data: {
          userId: user.id,
          tripId: trip.id,
          startDate, // Same date
          guests: 1,
          totalPrice: 25000,
        },
      });
      console.log("❌ Duplicate booking was allowed! Constraint not working.");
    } catch (duplicateError) {
      if (duplicateError.code === "P2002") {
        console.log("✅ Duplicate booking prevented! Constraint works.");
      } else {
        throw duplicateError;
      }
    }
    
    // Clean up
    await prisma.booking.delete({ where: { id: booking1.id } });
    
  } catch (error) {
    console.error("❌ Unique constraint test failed:", error.message);
  }
}

async function testIndexes() {
  console.log("\n🧪 Test 3: Index Performance");
  console.log("=".repeat(60));
  
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("⚠️  Skipping: Need at least one user in database");
      return;
    }
    
    // Test foreign key index on Trip.createdById
    console.log("\n📊 Query with indexed foreign key (Trip.createdById):");
    const tripsByCreator = await prisma.trip.findMany({
      where: { createdById: user.id },
      take: 5,
    });
    console.log(`✅ Found ${tripsByCreator.length} trips (query should use index)`);
    
    // Test status index on Booking
    console.log("\n📊 Query with indexed status field (Booking.status):");
    const confirmedBookings = await prisma.booking.findMany({
      where: { status: "CONFIRMED" },
      take: 5,
    });
    console.log(`✅ Found ${confirmedBookings.length} confirmed bookings (query should use index)`);
    
    // Test Image.uploadedById index
    console.log("\n📊 Query with indexed foreign key (Image.uploadedById):");
    const userImages = await prisma.image.findMany({
      where: { uploadedById: user.id },
      take: 5,
    });
    console.log(`✅ Found ${userImages.length} images (query should use index)`);
    
    console.log("\n✅ All indexed queries executed successfully!");
    console.log("💡 Check the query logs above to verify indexes are being used");
    
  } catch (error) {
    console.error("❌ Index test failed:", error.message);
  }
}

async function testCascadeRules() {
  console.log("\n🧪 Test 4: Cascade Delete Rules");
  console.log("=".repeat(60));
  
  try {
    // Test Blog.author cascade delete
    console.log("\n🔗 Testing Blog cascade delete (onDelete: Cascade)");
    
    const testUser = await prisma.user.create({
      data: {
        email: `test-cascade-${Date.now()}@example.com`,
        password: "test123",
        name: "Cascade Test User",
      },
    });
    
    const testBlog = await prisma.blog.create({
      data: {
        title: "Test Blog",
        slug: `test-blog-${Date.now()}`,
        content: JSON.stringify({ text: "Test content" }),
        authorId: testUser.id,
      },
    });
    
    console.log("✅ Created test user and blog");
    
    // Delete user - blog should be deleted too (cascade)
    await prisma.user.delete({ where: { id: testUser.id } });
    
    const blogStillExists = await prisma.blog.findUnique({
      where: { id: testBlog.id },
    });
    
    if (blogStillExists === null) {
      console.log("✅ Blog was deleted when author was deleted (Cascade works!)");
    } else {
      console.log("❌ Blog still exists! Cascade delete not working.");
    }
    
  } catch (error) {
    console.error("❌ Cascade test failed:", error.message);
  }
}

async function runAllTests() {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║       PRISMA SCHEMA IMPROVEMENTS TEST SUITE              ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  
  try {
    await testEnumConversion();
    await testUniqueConstraint();
    await testIndexes();
    await testCascadeRules();
    
    console.log("\n");
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║                  ✅ ALL TESTS COMPLETED                  ║");
    console.log("╚══════════════════════════════════════════════════════════╝");
    console.log("\n");
    
  } catch (error) {
    console.error("\n❌ Test suite error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runAllTests();
