async function main() {
  const API_URL = "http://localhost:3001";

  // 1. Login
  console.log("Logging in...");
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@local.test",
      password: "password123",
    }),
  });

  if (!loginRes.ok) {
    console.error("Login failed:", await loginRes.text());
    process.exit(1);
  }

  const { accessToken } = (await loginRes.json()) as any;
  console.log("Login successful, token received.");

  // 2. Update Profile with Preferences
  console.log("Updating profile preferences...");
  const newPreferences = { theme: "dark", notifications: { email: true, sms: false } };

  const updateRes = await fetch(`${API_URL}/users/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      preferences: newPreferences,
      bio: "Updated bio via verification script",
    }),
  });

  if (!updateRes.ok) {
    console.error("Update failed:", await updateRes.text());
    process.exit(1);
  }

  const updateData = (await updateRes.json()) as any;

  // 3. Verify Response
  console.log("Update response preferences:", JSON.stringify(updateData.user.preferences, null, 2));
  console.log("Expected preferences:", JSON.stringify(newPreferences, null, 2));

  if (JSON.stringify(updateData.user.preferences) === JSON.stringify(newPreferences)) {
    console.log("SUCCESS: Preferences updated correctly.");
  } else {
    console.error("FAILURE: Preferences did not match expected value.");
    process.exit(1);
  }
}

main().catch(console.error);
