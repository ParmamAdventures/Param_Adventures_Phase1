(async () => {
  try {
    const base = "http://localhost:3000";

    const loginResp = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test+1766053638.10583@example.com",
        password: "Password123!",
      }),
    });

    const loginData = await loginResp.json().catch(() => null);
    console.log("LOGIN_STATUS:", loginResp.status);
    console.log("LOGIN_BODY:", loginData);

    const accessToken = loginData?.accessToken;
    if (!accessToken) {
      console.error("No access token returned; aborting tests");
      process.exit(1);
    }

    const usersResp = await fetch(`${base}/admin/users`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const usersBody = await usersResp.json().catch(() => null);
    console.log("\nADMIN /admin/users", usersResp.status);
    console.log(usersBody);

    const rolesResp = await fetch(`${base}/admin/roles`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const rolesBody = await rolesResp.json().catch(() => null);
    console.log("\nADMIN /admin/roles", rolesResp.status);
    console.log(rolesBody);
  } catch (e) {
    console.error("ERROR:", e);
    process.exit(1);
  }
})();
