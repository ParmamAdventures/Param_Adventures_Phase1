import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1d9d6273ca6272d5f0fbf958799f490d@o4510641867784192.ingest.us.sentry.io/4510641896554496",

  // Adjust within Sentry dashboard later
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: true,
});

console.log("Param Adventures: Sentry Client SDK Initialized 🚀");
