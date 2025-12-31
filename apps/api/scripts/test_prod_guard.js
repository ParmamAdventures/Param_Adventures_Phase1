require("dotenv").config();
(async () => {
  const fetch = global.fetch || require("node-fetch");
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const expectMode = (process.env.EXPECT || "development").toLowerCase();
    console.log(`Running test_prod_guard.js (EXPECT=${expectMode})`);

    const admin = await prisma.user.findUnique({
      where: { email: "admin@local.test" },
    });
    if (!admin) {
      console.error("admin@local.test not found. Run ensure_admin.js first.");
      process.exit(2);
    }

    const booking = await prisma.booking.findFirst({
      where: { userId: admin.id, status: "CONFIRMED" },
      orderBy: { createdAt: "desc" },
    });
    if (!booking) {
      console.error("No CONFIRMED booking found for admin. Run seed_admin_booking.js first.");
      process.exit(2);
    }

    // Login
    const loginRes = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@local.test",
        password: "password123",
      }),
    });

    const loginText = await loginRes.text();
    let loginBody = null;
    try {
      loginBody = JSON.parse(loginText);
    } catch (e) {
      console.error("Login failed or returned non-json:", loginRes.status, loginText);
      process.exit(3);
    }
    const token = loginBody.accessToken || loginBody.token;
    if (!token) {
      console.error("No token returned from login");
      process.exit(3);
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
    let intentBody = null;
    try {
      intentBody = JSON.parse(intentText);
    } catch (e) {
      intentBody = intentText;
    }

    console.log("Response status:", intentRes.status);
    console.log("Response body:", intentBody);

    if (expectMode === "production") {
      if (intentRes.status === 500) {
        // look for PAYMENT_PROVIDER_NOT_CONFIGURED
        const bodyStr = typeof intentBody === "string" ? intentBody : JSON.stringify(intentBody);
        if (bodyStr.includes("PAYMENT_PROVIDER_NOT_CONFIGURED")) {
          console.log("✅ Production guard active: PAYMENT_PROVIDER_NOT_CONFIGURED returned");
          process.exit(0);
        }
        console.error("❌ Expected PAYMENT_PROVIDER_NOT_CONFIGURED in body but not found");
        process.exit(4);
      }
      console.error("❌ Expected 500 in production but got", intentRes.status);
      process.exit(4);
    }

    // development expectation: created and order_test_*
    if (expectMode === "development") {
      if (intentRes.status === 201) {
        const orderId = intentBody.orderId || intentBody.providerOrderId || "";
        if (String(orderId).startsWith("order_test_")) {
          console.log("✅ Dev fallback created order_test_* as expected");
          process.exit(0);
        }
        console.error("❌ Dev response did not contain order_test_*:", orderId);
        process.exit(4);
      }
      console.error("❌ Expected 201 in development but got", intentRes.status);
      process.exit(4);
    }

    console.error("Unknown EXPECT mode:", expectMode);
    process.exit(2);
  } catch (e) {
    console.error(e);
    try {
      await prisma.$disconnect();
    } catch {}
    process.exit(1);
  }
})();
