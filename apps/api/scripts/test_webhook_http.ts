import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import fetch from "node-fetch";

(async function main() {
  process.env.RAZORPAY_WEBHOOK_SECRET =
    process.env.RAZORPAY_WEBHOOK_SECRET || "testsecret";
  const prisma = new PrismaClient();
  try {
    // create user/trip/booking/payment similar to test_webhook_e2e
    const user = await prisma.user.create({
      data: {
        email: `http-post-${Date.now()}@local.test`,
        password: "x",
        name: "HTTP Test",
      },
    });
    const trip = await prisma.trip.create({
      data: {
        title: "T",
        slug: `t-${Date.now()}`,
        description: "d",
        itinerary: [],
        durationDays: 1,
        difficulty: "easy",
        location: "here",
        price: 1000,
        status: "PUBLISHED",
        createdById: user.id,
      },
    });
    const booking = await prisma.booking.create({
      data: { userId: user.id, tripId: trip.id, status: "CONFIRMED" },
    });
    const orderId = `order_test_${Date.now()}`;
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "razorpay",
        providerOrderId: orderId,
        amount: trip.price,
        status: "CREATED",
      },
    });

    const razorpayPaymentId = `pay_test_${Date.now()}`;
    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: { entity: { id: razorpayPaymentId, order_id: orderId } },
      },
    });
    const sig = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");

    const url =
      process.env.API_URL || "http://localhost:3001/webhooks/razorpay";
    console.log("POSTing webhook to", url);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": sig,
      },
      body: payload,
    });
    const body = await res.text();
    console.log("HTTP response", res.status, body);

    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    try {
      await prisma.$disconnect();
    } catch {}
    process.exit(1);
  }
})();
