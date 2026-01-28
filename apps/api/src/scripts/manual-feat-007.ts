import { prisma } from "../lib/prisma";
import { notificationQueue } from "../lib/queue";

async function run() {
  try {
    console.log("Starting Manual TEST (FEAT-007)...");

    // 1. Setup Data
    const user = await prisma.user.create({
      data: {
        email: `retry-feat007-${Date.now()}@test.com`,
        password: "password",
        name: "Retry Tester",
      },
    });

    const trip = await prisma.trip.create({
      data: {
        title: "Retry Trip",
        slug: `retry-trip-${Date.now()}`,
        price: 1000,
        startDate: new Date(),
        endDate: new Date(),
        durationDays: 1,
        difficulty: "EASY",
        location: "Retry Loc",
        description: "Retry Desc",
        itinerary: {},
        createdById: user.id,
        status: "PUBLISHED",
      },
    });

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        tripId: trip.id,
        totalPrice: 1000,
        status: "REQUESTED",
        paymentStatus: "PENDING",
        startDate: new Date(),
      },
    });

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "RAZORPAY",
        providerOrderId: "ord_retry_" + Date.now(),
        providerPaymentId: "pay_fake_" + Date.now(), // Fake ID will cause fetch failure -> Retry
        amount: 100000,
        status: "CREATED",
        method: "OTHER",
      },
    });

    console.log("Enqueuing RECONCILE_PAYMENT job for:", payment.id);
    const job = await notificationQueue.add("RECONCILE_PAYMENT", { paymentId: payment.id });
    console.log(`Job ${job.id} enqueued.`);

    // Wait to observe worker output (Manual verification of logs)
    console.log("Waiting 10s to observe worker logs/retries...");
    await new Promise((r) => setTimeout(r, 10000));

    // Cleanup
    await prisma.payment.delete({ where: { id: payment.id } });
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.trip.delete({ where: { id: trip.id } });
    await prisma.user.delete({ where: { id: user.id } });
  } catch (e) {
    console.error("Test Error:", e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

setTimeout(() => {
  console.error("Timeout");
  process.exit(1);
}, 30000);

run();
