import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://804fd9c6f0cbcc9b14cafb7678adb0e5@o4510641867784192.ingest.us.sentry.io/4510641892622336",

  // Adjust within Sentry dashboard later
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: true,
});

console.log("Param Adventures: Sentry Client SDK Initialized 🚀");
