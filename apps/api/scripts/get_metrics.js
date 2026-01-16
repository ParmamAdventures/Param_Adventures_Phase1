import "dotenv/config.js";
import fetch from "node-fetch";

(async () => {
  
  try {
    // login
    const loginRes = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@local.test",
        password: "password123",
      }),
    });
    const loginBody = await loginRes.json();
    const token = loginBody.accessToken || loginBody.token;
    if (!token) {
      console.error("No token from login", loginBody);
      process.exit(2);
    }

    const res = await fetch("http://localhost:3001/metrics/webhooks", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json().catch(() => null);
    console.log("Metrics status:", res.status);
    console.log("Metrics body:", body);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
