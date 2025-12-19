const base = process.env.API_URL || "http://localhost:3000";

async function http(path, opts = {}) {
  const res = await fetch(`${base}${path}`, opts);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text().catch(() => null);
  }
  return { status: res.status, body };
}

async function login(email, password = "Password123!") {
  return await http("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

async function register(email, password = "Password123!", name = "Smoke Test") {
  return await http("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
}

async function callWithToken(path, token) {
  return await http(path, { headers: { Authorization: `Bearer ${token}` } });
}

(async () => {
  try {
    console.log("Base API:", base);

    console.log("\nTest 1 — Logged-out user (expect 401/403)");
    const r1 = await http("/admin/users");
    console.log(
      "  /admin/users status",
      r1.status,
      r1.body && typeof r1.body === "object" ? JSON.stringify(r1.body) : r1.body
    );

    console.log("\nTest 2 — Normal user (fresh unprivileged) (expect 403)");
    const normalEmail = `normal+${Date.now()}@example.com`;
    console.log("  Registering normal user:", normalEmail);
    const reg = await register(normalEmail);
    if (reg.status < 200 || reg.status >= 300) {
      console.log("  Register failed:", reg.status, reg.body);
    }
    const normal = await login(normalEmail);
    if (normal.status !== 200) {
      console.log("  Normal user login failed:", normal.status, normal.body);
    }
    const normalToken = normal.body?.accessToken;
    const r2 = await callWithToken("/admin/users", normalToken);
    console.log(
      "  /admin/users status",
      r2.status,
      r2.body && typeof r2.body === "object" ? JSON.stringify(r2.body) : r2.body
    );

    console.log("\nTest 3 — Super admin (expect 200)");
    const superLogin = await login("test+1766053638.10583@example.com");
    if (superLogin.status !== 200) {
      console.log(
        "  Super admin login failed:",
        superLogin.status,
        superLogin.body
      );
      process.exit(1);
    }
    const superToken = superLogin.body?.accessToken;
    const ru = await callWithToken("/admin/users", superToken);
    console.log(
      "  /admin/users status",
      ru.status,
      Array.isArray(ru.body)
        ? `users=${ru.body.length}`
        : JSON.stringify(ru.body)
    );
    const rr = await callWithToken("/admin/roles", superToken);
    console.log(
      "  /admin/roles status",
      rr.status,
      Array.isArray(rr.body)
        ? `roles=${rr.body.length}`
        : JSON.stringify(rr.body)
    );

    console.log("\nSmoke test complete");
    process.exit(0);
  } catch (e) {
    console.error("ERROR", e);
    process.exit(1);
  }
})();
