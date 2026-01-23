import "dotenv/config";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Ensure Sentry is initialized as early as possible
if (!process.env.SENTRY_DSN || process.env.SENTRY_DSN.trim() === "") {
  console.log("Sentry Disabled (No DSN)");
} else {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions

    // Profiling
    profilesSampleRate: 1.0,
  });
}

console.log("Param Adventures API: Sentry Instrumented 🔭");
