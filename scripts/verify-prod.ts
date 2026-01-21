import axios from "axios";

/**
 * Verification script to be run post-deployment.
 * Checks core health endpoints and basic data accessibility.
 */
async function verifyDeployment() {
  const prodUrl = process.env.PRODUCTION_API_URL || "http://localhost:3001";
  console.log(`🔍 Starting deployment verification for: ${prodUrl}`);

  const checks = [
    { name: "API Health", path: "/health", expectedStatus: 200 },
    { name: "Public Trips", path: "/api/v1/trips", expectedStatus: 200 },
    { name: "API Docs", path: "/api-docs/", expectedStatus: 200 },
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      const response = await axios.get(`${prodUrl}${check.path}`);
      if (response.status === check.expectedStatus) {
        console.log(`✅ ${check.name}: Passed (${response.status})`);
      } else {
        console.error(
          `❌ ${check.name}: Failed (Expected ${check.expectedStatus}, got ${response.status})`
        );
        allPassed = false;
      }
    } catch (error: any) {
      console.error(`❌ ${check.name}: Critical Error - ${error.message}`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log("\n🚀 Deployment Verified! System is healthy.");
    process.exit(0);
  } else {
    console.error("\n💥 Deployment Verification FAILED! Check logs above.");
    process.exit(1);
  }
}

verifyDeployment();
