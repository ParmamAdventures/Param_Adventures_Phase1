import "dotenv/config.js";
import crypto from "crypto";
import http from "http";
import { PrismaClient } from "@prisma/client";

(async () => {
  const prisma = new PrismaClient();
  try {
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
    await prisma.payment.create({
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
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "testsecret")
      .update(payload)
      .digest("hex");

    const url = new URL(process.env.API_URL || "http://localhost:3001/webhooks/razorpay");

    const opts = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "x-razorpay-signature": sig,
      },
    };

    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log("HTTP response", res.statusCode, data);
      });
    });

    req.on("error", (e) => console.error("Request error", e));
    req.write(payload);
    req.end();

    // allow some time for request to be processed
    setTimeout(async () => {
      await prisma.$disconnect();
    }, 500);
  } catch (e) {
    console.error(e);
    try {
      await prisma.$disconnect();
    } catch {
      /* ignored */
    }
    process.exit(1);
  }
})();
