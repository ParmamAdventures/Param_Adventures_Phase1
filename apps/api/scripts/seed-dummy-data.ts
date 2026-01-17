#!/usr/bin/env node

/**
 * Dummy Data Seeding Script for Local Development
 * This script creates realistic dummy data for testing
 * Run: npm run seed:dummy
 */

import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function seedDummyData() {
  console.log("🌱 Starting dummy data seeding...\n");

  try {
    // 1. Create Users
    console.log("👥 Creating dummy users...");
    const hashedAdminPassword = await bcryptjs.hash("AdminPass123", 10);
    const hashedUserPassword = await bcryptjs.hash("UserPass123", 10);

    const adminUser = await prisma.user.upsert({
      where: { email: "admin@test.com" },
      update: {},
      create: {
        email: "admin@test.com",
        name: "Admin User",
        password: hashedAdminPassword,
        verified: true,
        phone: "+1-234-567-8900",
      },
    });

    const organizer = await prisma.user.upsert({
      where: { email: "organizer@test.com" },
      update: {},
      create: {
        email: "organizer@test.com",
        name: "Trip Organizer",
        password: hashedUserPassword,
        verified: true,
        phone: "+1-234-567-8901",
      },
    });

    const regularUser1 = await prisma.user.upsert({
      where: { email: "user1@test.com" },
      update: {},
      create: {
        email: "user1@test.com",
        name: "John Doe",
        password: hashedUserPassword,
        verified: true,
        phone: "+1-234-567-8902",
      },
    });

    const regularUser2 = await prisma.user.upsert({
      where: { email: "user2@test.com" },
      update: {},
      create: {
        email: "user2@test.com",
        name: "Jane Smith",
        password: hashedUserPassword,
        verified: true,
        phone: "+1-234-567-8903",
      },
    });

    console.log("✅ Created 4 users\n");

    // 2. Create Roles
    console.log("👮 Creating roles...");
    const adminRole = await prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: {
        name: "admin",
        description: "Administrator with full access",
      },
    });

    const organizerRole = await prisma.role.upsert({
      where: { name: "organizer" },
      update: {},
      create: {
        name: "organizer",
        description: "Can create and manage trips",
      },
    });

    const userRole = await prisma.role.upsert({
      where: { name: "user" },
      update: {},
      create: {
        name: "user",
        description: "Regular user",
      },
    });

    console.log("✅ Created 3 roles\n");

    // 3. Assign Roles to Users
    console.log("🔐 Assigning roles...");
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: organizer.id,
          roleId: organizerRole.id,
        },
      },
      update: {},
      create: {
        userId: organizer.id,
        roleId: organizerRole.id,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: regularUser1.id,
          roleId: userRole.id,
        },
      },
      update: {},
      create: {
        userId: regularUser1.id,
        roleId: userRole.id,
      },
    });

    console.log("✅ Assigned roles\n");

    // 4. Create Trips
    console.log("🗺️ Creating dummy trips...");
    const trips = await Promise.all([
      prisma.trip.upsert({
        where: { slug: "himalayan-trek" },
        update: {},
        create: {
          slug: "himalayan-trek",
          title: "Himalayan Trek Adventure",
          description: "Experience the breathtaking beauty of the Himalayas with expert guides",
          location: "Himachal Pradesh, India",
          category: "Adventure",
          price: 50000,
          currency: "INR",
          duration: 5,
          maxParticipants: 20,
          image:
            "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
          published: true,
          creatorId: organizer.id,
        },
      }),
      prisma.trip.upsert({
        where: { slug: "beach-getaway" },
        update: {},
        create: {
          slug: "beach-getaway",
          title: "Tropical Beach Getaway",
          description: "Relax on pristine beaches with crystal-clear waters",
          location: "Goa, India",
          category: "Relaxation",
          price: 35000,
          currency: "INR",
          duration: 3,
          maxParticipants: 30,
          image:
            "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
          published: true,
          creatorId: organizer.id,
        },
      }),
      prisma.trip.upsert({
        where: { slug: "desert-safari" },
        update: {},
        create: {
          slug: "desert-safari",
          title: "Rajasthan Desert Safari",
          description: "Explore the golden dunes and experience desert culture",
          location: "Rajasthan, India",
          category: "Adventure",
          price: 45000,
          currency: "INR",
          duration: 4,
          maxParticipants: 25,
          image:
            "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800",
          published: true,
          creatorId: organizer.id,
        },
      }),
    ]);

    console.log("✅ Created 3 trips\n");

    // 5. Create Bookings
    console.log("📅 Creating dummy bookings...");
    const bookings = await Promise.all([
      prisma.booking.create({
        data: {
          userId: regularUser1.id,
          tripId: trips[0].id,
          status: "CONFIRMED",
          totalPrice: 50000,
          numPeople: 2,
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          specialRequests: "Vegetarian meals needed",
          guestDetails: [
            {
              name: "John Doe",
              email: "john@example.com",
              phone: "+1-234-567-8902",
            },
            {
              name: "Sarah Doe",
              email: "sarah@example.com",
              phone: "+1-234-567-8904",
            },
          ],
        },
      }),
      prisma.booking.create({
        data: {
          userId: regularUser2.id,
          tripId: trips[1].id,
          status: "PENDING",
          totalPrice: 35000,
          numPeople: 1,
          startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          specialRequests: "No special requests",
          guestDetails: [
            {
              name: "Jane Smith",
              email: "jane@example.com",
              phone: "+1-234-567-8903",
            },
          ],
        },
      }),
    ]);

    console.log("✅ Created 2 bookings\n");

    // 6. Create Payments
    console.log("💳 Creating dummy payments...");
    await Promise.all([
      prisma.payment.create({
        data: {
          bookingId: bookings[0].id,
          amount: 50000,
          currency: "INR",
          status: "CAPTURED",
          razorpayPaymentId: "pay_test_001",
          razorpayOrderId: "order_test_001",
          method: "card",
        },
      }),
    ]);

    console.log("✅ Created 1 payment\n");

    // 7. Create Reviews
    console.log("⭐ Creating dummy reviews...");
    await Promise.all([
      prisma.review.create({
        data: {
          userId: regularUser1.id,
          tripId: trips[0].id,
          rating: 5,
          title: "Amazing Experience!",
          content: "The trek was incredible. Guides were knowledgeable and supportive.",
          published: true,
        },
      }),
      prisma.review.create({
        data: {
          userId: regularUser2.id,
          tripId: trips[1].id,
          rating: 4,
          title: "Great Beach Getaway",
          content: "Beautiful beaches and good accommodations. Highly recommend!",
          published: true,
        },
      }),
    ]);

    console.log("✅ Created 2 reviews\n");

    // 8. Summary
    console.log("═════════════════════════════════════════");
    console.log("✅ DUMMY DATA SEEDING COMPLETED\n");
    console.log("📊 Summary:");
    console.log("   • 4 Users created");
    console.log("   • 3 Roles created");
    console.log("   • 3 Trips created");
    console.log("   • 2 Bookings created");
    console.log("   • 1 Payment created");
    console.log("   • 2 Reviews created\n");
    console.log("🔐 Test Credentials:");
    console.log("   Admin: admin@test.com / AdminPass123");
    console.log("   User:  user1@test.com / UserPass123");
    console.log("   User:  user2@test.com / UserPass123\n");
    console.log("═════════════════════════════════════════\n");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDummyData();
