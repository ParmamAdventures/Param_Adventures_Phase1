import crypto from "crypto";
import { prisma } from "../lib/prisma";

// 1. Setup Environment & Mock Secret
process.env.RAZORPAY_WEBHOOK_SECRET = "test_secret";

import { app } from "../app";
import { notificationWorker } from "../lib/queue"; // Start worker
import request from "supertest";

async function run() {
  try {
    console.log("Starting Manual Webhook Test...");

    // 2. Setup Data
    const orderId = "order_wh_" + Date.now();
    const paymentId = "pay_wh_" + Date.now();

    // Create User
    const user = await prisma.user.create({
      data: {
        email: `test-wh-${Date.now()}@webhook.com`,
        name: "Webhook Tester",
        password: "password",
      },
    });

    // Create Trip
    const trip = await prisma.trip.create({
      data: {
        title: "Webhook Trip",
        slug: `wh-trip-${Date.now()}`,
        description: "Test trip description",
        itinerary: {}, // JSON field
        price: 1000,
        startDate: new Date(),
        endDate: new Date(),
        durationDays: 1,
        difficulty: "EASY",
        location: "Test Location",
        createdById: user.id,
        status: "PUBLISHED",
      },
    });

    // Create Booking (PENDING)
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        tripId: trip.id,
        totalPrice: 1000,
        status: "REQUESTED",
        startDate: new Date(),
      },
    });

    // Create Payment (CREATED)
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "RAZORPAY",
        providerOrderId: orderId,
        amount: 100000,
        status: "CREATED",
        method: "OTHER",
      },
    });

    console.log("Setup complete. Booking:", booking.id, "Payment:", payment.id);

    // 3. Construct Payload
    const payload = JSON.stringify({
      entity: "event",
      account_id: "acc_test",
      event: "payment.captured",
      contains: ["payment"],
      payload: {
        payment: {
          entity: {
            id: paymentId,
            entity: "payment",
            amount: 100000,
            currency: "INR",
            status: "captured",
            order_id: orderId,
            email: user.email,
            contact: "+919999999999",
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    });

    // 4. Calculate Signature
    const signature = crypto.createHmac("sha256", "test_secret").update(payload).digest("hex");

    // 5. Send Webhook Request
    console.log("Sending Webhook...");
    const res = await request(app)
      .post("/webhooks/razorpay")
      .set("x-razorpay-signature", signature)
      .set("Content-Type", "application/json")
      .send(payload);

    console.log("Response:", res.status, res.body);

    if (res.status === 200) {
      console.log("✅ Webhook accepted");

      // Wait for async worker
      console.log("Waiting for worker to process...");
      await new Promise((r) => setTimeout(r, 5000));

      // Verify DB Updates
      const updatedPayment = await prisma.payment.findUnique({ where: { id: payment.id } });
      const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });

      console.log("Payment Status:", updatedPayment?.status);
      console.log("Booking Status:", updatedBooking?.status);

      if (updatedPayment?.status === "CAPTURED" && updatedBooking?.status === "CONFIRMED") {
        console.log("✅ DB Updated Correctly");
      } else {
        console.error("❌ DB Update Failed");
      }
    } else {
      console.error("❌ Webhook rejected");
    }

    // Cleanup
    await prisma.payment.deleteMany({ where: { bookingId: booking.id } });
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.trip.delete({ where: { id: trip.id } });
    await prisma.user.delete({ where: { id: user.id } });
  } catch (e) {
    console.error("Webhook Test Error:", e);
  } finally {
    await prisma.$disconnect();
    await notificationWorker.close(); // Close worker to exit
    console.log("Done");
    process.exit(0);
  }
}

// Timeout
setTimeout(() => {
  console.error("Timeout");
  process.exit(1);
}, 30000);

run();
