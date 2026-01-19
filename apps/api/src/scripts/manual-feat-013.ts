import { prisma } from "../lib/prisma";
import request from "supertest";
import { app } from "../app";
import {
  handleDisputeCreated,
  handleDisputeLost,
  handleDisputeWon,
} from "../controllers/paymentEvents";

async function run() {
  try {
    console.log("Starting Manual TEST (FEAT-013 Dispute Handling)...");

    // 1. Setup Data
    const admin = await prisma.user.upsert({
      where: { email: "admin-dispute@test.com" },
      create: {
        email: "admin-dispute@test.com",
        password: "pw",
        name: "Admin",
        roles: { create: { role: { create: { name: "admin" } } } },
      },
      update: {},
    });

    const trip = await prisma.trip.create({
      data: {
        title: "Dispute Trip",
        slug: `disp-trip-${Date.now()}`,
        price: 2000,
        createdById: admin.id,
        status: "PUBLISHED",
        description: "Test",
        itinerary: {},
        difficulty: "EASY",
        location: "Loc",
        durationDays: 1,
        startDate: new Date(),
        endDate: new Date(),
      },
    });
    const booking = await prisma.booking.create({
      data: {
        userId: admin.id,
        tripId: trip.id,
        totalPrice: 2000,
        status: "CONFIRMED",
        startDate: new Date(),
        paymentStatus: "PAID",
      },
    });

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "razorpay",
        providerOrderId: "ord_disp_" + Date.now(),
        providerPaymentId: "pay_disp_" + Date.now(),
        amount: 200000,
        status: "CAPTURED",
      },
    });

    console.log("Initial Payment Status:", payment.status);

    // 2. Simulate Dispute Created
    console.log("Simulating Dispute Created...");
    const disputeId = "dsp_" + Date.now();
    await handleDisputeCreated({
      payload: {
        dispute: {
          entity: {
            id: disputeId,
            payment_id: payment.providerPaymentId,
          },
        },
      },
    });

    const paymentDisputed = await prisma.payment.findUnique({ where: { id: payment.id } });
    console.log(`Payment Status after Dispute: ${paymentDisputed?.status} (Expected: DISPUTED)`);
    console.log(`Dispute ID: ${paymentDisputed?.disputeId} (Expected: ${disputeId})`);

    if (paymentDisputed?.status !== "DISPUTED" || paymentDisputed?.disputeId !== disputeId) {
      throw new Error("❌ Dispute Created verification failed");
    }

    // 3. Simulate Dispute Won
    console.log("Simulating Dispute Won...");
    await handleDisputeWon({
      payload: {
        dispute: {
          entity: {
            id: disputeId,
            payment_id: payment.providerPaymentId,
          },
        },
      },
    });
    const paymentWon = await prisma.payment.findUnique({ where: { id: payment.id } });
    console.log(`Payment Status after Won: ${paymentWon?.status} (Expected: CAPTURED)`);

    if (paymentWon?.status !== "CAPTURED") {
      throw new Error("❌ Dispute Won verification failed");
    }

    // 4. Simulate Dispute Lost
    console.log("Simulating Dispute Lost...");
    await handleDisputeLost({
      payload: {
        dispute: {
          entity: {
            id: disputeId,
            payment_id: payment.providerPaymentId,
          },
        },
      },
    });
    const paymentLost = await prisma.payment.findUnique({ where: { id: payment.id } });
    const bookingLost = await prisma.booking.findUnique({ where: { id: booking.id } });

    console.log(`Payment Status after Lost: ${paymentLost?.status} (Expected: REFUNDED)`);
    console.log(`Booking Status after Lost: ${bookingLost?.status} (Expected: CANCELLED)`);

    if (paymentLost?.status !== "REFUNDED" || bookingLost?.status !== "CANCELLED") {
      throw new Error("❌ Dispute Lost verification failed");
    }

    console.log("✅ All Dispute Logic Verification Passed");
  } catch (e) {
    console.error("Test Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
