"use client";

import { useEffect } from "react";
// Import the config file to trigger the Sentry.init() call on the client
import "../sentry.client.config";

export function SentryInitializer() {
  useEffect(() => {
    console.log("Param Adventures: Sentry Client Initializer Mounted 🔌");
  }, []);
  return null;
}
