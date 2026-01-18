/**
 * Simple Schema Tests - Direct verification
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runTests() {
  const results = {
    enumTest: false,
    uniqueConstraintTest: false,
    indexTest: false,
    cascadeTest: false,
  };

  // Test 1: Enum Conversion
  try {
    const inquiry = await prisma.tripInquiry.create({
      data: {
        name: "Test",
        email: "test@test.com",
        destination: "Test",
        status: "NEW",
      },
    });
    await prisma.tripInquiry.update({
      where: { id: inquiry.id },
      data: { status: "CONTACTED" },
    });
    await prisma.tripInquiry.delete({ where: { id: inquiry.id } });
    results.enumTest = true;
    console.log("PASS: Enum conversion works");
  } catch (e) {
    console.log("FAIL: Enum test -", e.message);
  }

  // Test 2: Unique Constraint
  try {
    const user = await prisma.user.findFirst();
    const trip = await prisma.trip.findFirst();
    
    if (user && trip) {
      const startDate = new Date("2026-07-01");
      const b1 = await prisma.booking.create({
        data: {
          userId: user.id,
          tripId: trip.id,
          startDate,
          guests: 1,
          totalPrice: 1000,
        },
      });

      try {
        await prisma.booking.create({
          data: {
            userId: user.id,
            tripId: trip.id,
            startDate,
            guests: 2,
            totalPrice: 2000,
          },
        });
        console.log("FAIL: Duplicate booking allowed");
      } catch (dupError) {
        if (dupError.code === "P2002") {
          results.uniqueConstraintTest = true;
          console.log("PASS: Unique constraint prevents duplicates");
        }
      }

      await prisma.booking.delete({ where: { id: b1.id } });
    } else {
      console.log("SKIP: Unique constraint (no data)");
    }
  } catch (e) {
    console.log("FAIL: Unique constraint -", e.message);
  }

  // Test 3: Indexes (just verify queries work)
  try {
    const user = await prisma.user.findFirst();
    if (user) {
      await prisma.trip.findMany({ where: { createdById: user.id }, take: 1 });
      await prisma.image.findMany({ where: { uploadedById: user.id }, take: 1 });
      await prisma.booking.findMany({ where: { status: "CONFIRMED" }, take: 1 });
      results.indexTest = true;
      console.log("PASS: Indexed queries execute successfully");
    } else {
      console.log("SKIP: Index test (no data)");
    }
  } catch (e) {
    console.log("FAIL: Index test -", e.message);
  }

  // Test 4: Cascade Delete
  try {
    const testUser = await prisma.user.create({
      data: {
        email: `cascade-test-${Date.now()}@test.com`,
        password: "test",
        name: "Cascade Test",
      },
    });

    const testBlog = await prisma.blog.create({
      data: {
        title: "Test Blog",
        slug: `test-${Date.now()}`,
        content: JSON.stringify({ text: "test" }),
        authorId: testUser.id,
      },
    });

    await prisma.user.delete({ where: { id: testUser.id } });
    
    const blogExists = await prisma.blog.findUnique({
      where: { id: testBlog.id },
    });

    if (blogExists === null) {
      results.cascadeTest = true;
      console.log("PASS: Cascade delete works");
    } else {
      console.log("FAIL: Blog not deleted with user");
    }
  } catch (e) {
    console.log("FAIL: Cascade test -", e.message);
  }

  await prisma.$disconnect();

  // Summary
  console.log("\n--- TEST SUMMARY ---");
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log("\nSUCCESS: All schema improvements verified!");
    process.exit(0);
  } else {
    console.log("\nWARNING: Some tests failed");
    process.exit(1);
  }
}

runTests();
