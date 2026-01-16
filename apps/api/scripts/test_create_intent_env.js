import "dotenv/config.js";
import fetch from "node-fetch";
import { PrismaClient  } from "@prisma/client";

(async () => {
  
  
  const prisma = new PrismaClient();

  try {
    console.log(
      "Running test_create_intent_env.js with NODE_ENV=",
      process.env.NODE_ENV || "(unset)",
    );

    const admin = await prisma.user.findUnique({
      where: { email: "admin@local.test" },
    });
    if (!admin) {
      console.error("admin@local.test not found. Run ensure_admin.js first.");
      process.exit(1);
    }

    const booking = await prisma.booking.findFirst({
      where: { userId: admin.id, status: "CONFIRMED" },
      orderBy: { createdAt: "desc" },
    });
    if (!booking) {
      console.error("No CONFIRMED booking found for admin. Run seed_admin_booking.js first.");
      process.exit(1);
    }

    // Login to get token
    const loginRes = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@local.test",
        password: "password123",
      }),
    });

    const loginBody = await loginRes.text();
    let token = null;
    try {
      const jb = JSON.parse(loginBody);
      token = jb.accessToken || jb.token || null;
    } catch {
      console.error("Login failed or returned non-json:", loginRes.status, loginBody);
      process.exit(1);
    }

    if (!token) {
      console.error("No token returned from login:", loginBody);
      process.exit(1);
    }

    console.log("Using bookingId:", booking.id);

    const intentRes = await fetch("http://localhost:3001/payments/intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookingId: booking.id }),
    });

    const intentText = await intentRes.text();
    let intentBody = intentText;
    try {
      intentBody = JSON.parse(intentText);
    } catch { /* ignored */ }

    console.log("Response status:", intentRes.status);
    console.log("Response body:", intentBody);

    // Check whether a Payment row was created for this booking
    const payments = await prisma.payment.findMany({
      where: { bookingId: booking.id },
      orderBy: { createdAt: "desc" },
    });
    console.log(
      "Payments for booking (latest 5):",
      payments.slice(0, 5).map((p) => ({
        id: p.id,
        providerOrderId: p.providerOrderId,
        status: p.status,
        createdAt: p.createdAt,
      })),
    );

    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    try {
      await prisma.$disconnect();
    } catch { /* ignored */ }
    process.exit(1);
  }
})();
