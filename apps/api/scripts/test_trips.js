// Basic trip endpoints smoke check. Requires API server running at http://localhost:3000
// Usage: node scripts/test_trips.js

const base = process.env.BASE || "http://localhost:3000";

async function ok(path, opts) {
  try {
    const res = await fetch(base + path, opts);
    console.log(path, res.status);
    try {
      const j = await res.json();
      console.log(JSON.stringify(j, null, 2));
    } catch {
      /* ignored */
      /* empty */
    }
  } catch {
    console.error(`Unable to connect to ${base} — is the API server running?`);
    console.error("Start the API in another terminal:");
    console.error("  cd apps/api && npm run dev");
    process.exit(1);
  }
}

(async () => {
  console.log("Checking public trips (should be 200)");
  await ok("/trips/public");

  console.log("Checking internal trips without auth (should be 401/403)");
  await ok("/trips/internal");

  console.log(
    "Done. For full lifecycle tests create uploader/admin accounts and exercise /trips endpoints with auth.",
  );
})();
