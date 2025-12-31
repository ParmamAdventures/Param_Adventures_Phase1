require("dotenv").config();
const fetch = globalThis.fetch;
(async () => {
  try {
    const base = "http://localhost:3001";
    const loginRes = await fetch(base + "/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "admin@local.test", password: "password123" }),
    });
    const loginJson = await loginRes.json();
    console.log("LOGIN STATUS", loginRes.status, loginJson);
    if (!loginJson?.accessToken) return;
    const token = loginJson.accessToken;

    const r2 = await fetch(base + "/admin/trips/0c658754-14d4-4751-b7ed-c4ea1b3a303b/bookings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("BOOKINGS STATUS", r2.status);
    const t = await r2.text();
    console.log("BODY", t);
  } catch (e) {
    console.error(e);
  }
})();
