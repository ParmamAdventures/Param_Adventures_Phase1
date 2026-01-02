"use client";

import { useEffect } from "react";
// Import the config file to trigger the Sentry.init() call on the client
import "../sentry.client.config";

export function SentryInitializer() {
  useEffect(() => {
    // Sentry initialized via import side-effect
  }, []);
  return null;
}
