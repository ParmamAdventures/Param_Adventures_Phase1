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
  console.log("Starting dummy data seeding...\n");

  try {
    // 1. Create Users
    console.log("Creating dummy users...");
    const hashedAdminPassword = await bcryptjs.hash("AdminPass123", 10);
    const hashedUserPassword = await bcryptjs.hash("UserPass123", 10);

    const adminUser = await prisma.user.upsert({
      where: { email: "admin@test.com" },
      update: {},
      create: {
        email: "admin@test.com",
        name: "Admin User",
        password: hashedAdminPassword,
        phoneNumber: "+1-234-567-8900",
      },
    });

    const organizer = await prisma.user.upsert({
      where: { email: "organizer@test.com" },
      update: {},
      create: {
        email: "organizer@test.com",
        name: "Trip Organizer",
        password: hashedUserPassword,
        phoneNumber: "+1-234-567-8901",
      },
    });

    const regularUser1 = await prisma.user.upsert({
      where: { email: "user1@test.com" },
      update: {},
      create: {
        email: "user1@test.com",
        name: "John Doe",
        password: hashedUserPassword,
        phoneNumber: "+1-234-567-8902",
      },
    });

    const regularUser2 = await prisma.user.upsert({
      where: { email: "user2@test.com" },
      update: {},
      create: {
        email: "user2@test.com",
        name: "Jane Smith",
        password: hashedUserPassword,
        phoneNumber: "+1-234-567-8903",
      },
    });

    console.log("Created 4 users\n");

    // 2. Create Roles
    console.log("Creating roles...");
    const adminRole = await prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: {
        name: "admin",
        description: "Administrator with full access",
        isSystem: true,
      },
    });

    const organizerRole = await prisma.role.upsert({
      where: { name: "organizer" },
      update: {},
      create: {
        name: "organizer",
        description: "Can create and manage trips",
        isSystem: true,
      },
    });

    const userRole = await prisma.role.upsert({
      where: { name: "user" },
      update: {},
      create: {
        name: "user",
        description: "Regular user",
        isSystem: true,
      },
    });

    console.log("Created 3 roles\n");

    // 3. Assign Roles to Users
    console.log("Assigning roles...");
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

    console.log("Assigned roles\n");

    // 4. Create Trips
    console.log("Creating dummy trips...");
    const trip1 = await prisma.trip.upsert({
      where: { slug: "himalayan-trek-2024" },
      update: {},
      create: {
        title: "Himalayan Trek Adventure",
        slug: "himalayan-trek-2024",
        description:
          "Experience the breathtaking beauty of the Himalayas with expert guides. This 5-day trek takes you through remote mountain villages and pristine alpine meadows.",
        itinerary: {
          day1: "Arrival and acclimatization",
          day2: "Trek to base camp",
          day3: "High altitude exploration",
          day4: "Summit attempt",
          day5: "Descent and celebration",
        },
        durationDays: 5,
        difficulty: "Hard",
        location: "Himalayas, India",
        price: 5000000, // In paise (₹50,000)
        category: "TREK",
        capacity: 20,
        status: "PUBLISHED",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-06-05"),
        createdById: organizer.id,
        approvedById: adminUser.id,
        publishedAt: new Date(),
        highlights: [
          "Stunning mountain views",
          "Experience local culture",
          "Professional guides",
          "All meals included",
        ],
        inclusions: ["Accommodation", "Meals", "Guide services", "Equipment rental"],
        exclusions: ["Travel insurance", "Personal expenses"],
        cancellationPolicy: {
          days30: "100% refund",
          days15: "50% refund",
          days7: "No refund",
        },
      },
    });

    const trip2 = await prisma.trip.upsert({
      where: { slug: "beach-getaway-2024" },
      update: {},
      create: {
        title: "Beach Getaway Relaxation",
        slug: "beach-getaway-2024",
        description:
          "Unwind at our exclusive beach retreat. Three days of sun, sand, and sea with world-class amenities.",
        itinerary: {
          day1: "Arrival and check-in",
          day2: "Water activities and beach exploration",
          day3: "Spa and departure",
        },
        durationDays: 3,
        difficulty: "Easy",
        location: "Goa, India",
        price: 3500000, // In paise (₹35,000)
        category: "CAMPING",
        capacity: 30,
        status: "PUBLISHED",
        startDate: new Date("2024-07-01"),
        endDate: new Date("2024-07-03"),
        createdById: organizer.id,
        approvedById: adminUser.id,
        publishedAt: new Date(),
        highlights: [
          "Beautiful beaches",
          "Water sports",
          "Luxury accommodations",
          "Gourmet dining",
        ],
        inclusions: ["Resort stay", "All meals", "Beach activities", "Spa treatments"],
        exclusions: ["Flights", "Travel insurance"],
        cancellationPolicy: {
          days30: "100% refund",
          days15: "75% refund",
          days7: "50% refund",
        },
      },
    });

    const trip3 = await prisma.trip.upsert({
      where: { slug: "desert-safari-2024" },
      update: {},
      create: {
        title: "Desert Safari Adventure",
        slug: "desert-safari-2024",
        description:
          "Discover the magic of the desert with thrilling safari experiences and stunning sunsets.",
        itinerary: {
          day1: "Arrival and desert orientation",
          day2: "Safari expedition",
          day3: "Cultural tour and departure",
          day4: "Extended exploration",
        },
        durationDays: 4,
        difficulty: "Medium",
        location: "Rajasthan, India",
        price: 4500000, // In paise (₹45,000)
        category: "TREK",
        capacity: 25,
        status: "PUBLISHED",
        startDate: new Date("2024-08-01"),
        endDate: new Date("2024-08-04"),
        createdById: organizer.id,
        approvedById: adminUser.id,
        publishedAt: new Date(),
        highlights: ["Camel safari", "Stunning sunsets", "Local culture", "Campfire experience"],
        inclusions: ["Accommodation", "Meals", "Safari activities", "Cultural shows"],
        exclusions: ["Personal shopping", "Tips"],
        cancellationPolicy: {
          days30: "100% refund",
          days15: "60% refund",
          days7: "30% refund",
        },
      },
    });

    console.log("Created 3 sample trips\n");

    // 5. Create Bookings
    console.log("Creating sample bookings...");

    const booking1 = await prisma.booking.upsert({
      where: {
        id: "booking-1-dummy",
      },
      update: {},
      create: {
        userId: regularUser1.id,
        tripId: trip1.id,
        status: "CONFIRMED",
        guests: 2,
        totalPrice: 10000000, // 2 x ₹50,000
        startDate: new Date("2024-06-01"),
        guestDetails: [
          {
            name: "John Doe",
            email: "john@example.com",
            age: 30,
            gender: "Male",
          },
          {
            name: "Sarah Doe",
            email: "sarah@example.com",
            age: 28,
            gender: "Female",
          },
        ],
      },
    });

    const booking2 = await prisma.booking.upsert({
      where: { id: "booking-2-dummy" },
      update: {},
      create: {
        userId: regularUser2.id,
        tripId: trip2.id,
        status: "REQUESTED",
        guests: 1,
        totalPrice: 3500000, // 1 x ₹35,000
        startDate: new Date("2024-07-01"),
        guestDetails: [
          {
            name: "Jane Smith",
            email: "jane@example.com",
            age: 25,
            gender: "Female",
          },
        ],
      },
    });

    console.log("Created 2 sample bookings\n");

    // 6. Create Payments
    console.log("Creating sample payments...");

    const payment1 = await prisma.payment.upsert({
      where: { providerOrderId: "razorpay-order-1-dummy" },
      update: {},
      create: {
        bookingId: booking1.id,
        provider: "razorpay",
        providerOrderId: "razorpay-order-1-dummy",
        providerPaymentId: "razorpay-payment-1-dummy",
        amount: 10000000, // In paise
        currency: "INR",
        status: "CAPTURED",
        method: "card",
        rawPayload: {
          orderId: "razorpay-order-1-dummy",
          paymentId: "razorpay-payment-1-dummy",
          signature: "dummy-signature",
        },
      },
    });

    console.log("Created 1 sample payment\n");

    // 7. Create Reviews
    console.log("Creating sample reviews...");

    const review1 = await prisma.review.upsert({
      where: { userId_tripId: { userId: regularUser1.id, tripId: trip1.id } },
      update: {},
      create: {
        rating: 5,
        comment:
          "Amazing experience! The guides were knowledgeable and the scenery was breathtaking. Highly recommend!",
        userId: regularUser1.id,
        tripId: trip1.id,
      },
    });

    const review2 = await prisma.review.upsert({
      where: { userId_tripId: { userId: regularUser2.id, tripId: trip2.id } },
      update: {},
      create: {
        rating: 4,
        comment:
          "Great beach resort with excellent service. Would have given 5 stars if not for minor food delays.",
        userId: regularUser2.id,
        tripId: trip2.id,
      },
    });

    console.log("Created 2 sample reviews\n");

    // 8. Summary
    console.log("===========================================");
    console.log("DUMMY DATA SEEDING COMPLETED\n");
    console.log("Summary:");
    console.log("   - 4 Users created");
    console.log("   - 3 Roles created");
    console.log("   - 3 Trips created");
    console.log("   - 2 Bookings created");
    console.log("   - 1 Payment created");
    console.log("   - 2 Reviews created\n");
    console.log("Test Credentials:");
    console.log("   Admin: admin@test.com / AdminPass123");
    console.log("   User:  user1@test.com / UserPass123");
    console.log("   User:  user2@test.com / UserPass123\n");
    console.log("===========================================\n");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding
seedDummyData();
