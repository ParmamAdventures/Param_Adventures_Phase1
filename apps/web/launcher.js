import { execSync } from "child_process";

// 1. Install Dependencies
console.log(">>> [Launcher] Installing dependencies...");
try {
  execSync("npm install", { stdio: "inherit" });
} catch {
  console.error(">>> [Launcher] npm install failed.");
  process.exit(1);
}

// 2. Build via Next.js
console.log(">>> [Launcher] Building application...");
try {
  execSync("npm run build", { stdio: "inherit" });
} catch {
  console.error(">>> [Launcher] Build failed.");
  process.exit(1);
}

// 3. Start Server
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 3000;
console.log(`>>> [Launcher] Starting Next.js on port: ${port}`);

try {
  // Explicitly bind to 0.0.0.0 to be safe
  execSync(`npx next start -H 0.0.0.0 -p ${port}`, { stdio: "inherit" });
} catch (e) {
  console.error(">>> [Launcher] App crashed:", e);
  process.exit(1);
}
