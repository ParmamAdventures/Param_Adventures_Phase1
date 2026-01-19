import { signAccessToken } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import request from "supertest";
import { app } from "../app";
import fs from "fs";
import path from "path";

async function run() {
  try {
    console.log("Starting Manual TEST (FEAT-008)...");

    // 1. Setup Data
    const user = await prisma.user.create({
      data: {
        email: `invoice-feat008-${Date.now()}@test.com`,
        password: "password",
        name: "Invoice Tester",
      },
    });
    const token = signAccessToken(user.id);

    const trip = await prisma.trip.create({
      data: {
        title: "Invoice Trip",
        slug: `invoice-trip-${Date.now()}`,
        price: 5000,
        startDate: new Date(),
        endDate: new Date(),
        durationDays: 5,
        difficulty: "MODERATE",
        location: "Invoice Loc",
        description: "Desc",
        itinerary: {},
        createdById: user.id, // self-created for simplicity
        status: "PUBLISHED",
      },
    });

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        tripId: trip.id,
        totalPrice: 5000,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        startDate: new Date(),
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "razorpay",
        providerOrderId: "ord_inv_" + Date.now(),
        amount: 500000,
        status: "CAPTURED",
      },
    });

    // 2. Download Invoice
    console.log(`Testing GET /bookings/${booking.id}/invoice...`);
    const res = await request(app)
      .get(`/bookings/${booking.id}/invoice`)
      .set("Authorization", `Bearer ${token}`)
      .buffer(true) // Important for binary response
      .parse((res, callback) => {
        res.setEncoding("binary");
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          callback(null, Buffer.from(data, "binary"));
        });
      });

    console.log("Status Code:", res.status);
    if (res.status === 200 && res.header["content-type"] === "application/pdf") {
      console.log("✅ Invoice Endpoint Works");
      const filePath = path.join(__dirname, "test_invoice.pdf");
      fs.writeFileSync(filePath, res.body);
      console.log(`Saved invoice to ${filePath} (Size: ${res.body.length} bytes)`);

      if (res.body.length > 1000) {
        // Empty PDF is small, actual one should be larger
        console.log("✅ PDF seems valid (size > 1KB)");
      } else {
        console.error("⚠️ PDF seems too small");
      }
    } else {
      console.error("❌ Invoice Failed:", JSON.stringify(res.body));
    }

    // Cleanup
    // await prisma.payment.deleteMany({ where: { bookingId: booking.id } });
    // await prisma.booking.delete({ where: { id: booking.id } });
    // await prisma.trip.delete({ where: { id: trip.id } });
    // await prisma.user.delete({ where: { id: user.id } });
  } catch (e) {
    console.error("Test Error:", e);
  } finally {
    await prisma.$disconnect();
    // process.exit(0);
  }
}

// setTimeout(() => { console.error("Timeout"); process.exit(1); }, 30000);

run();
