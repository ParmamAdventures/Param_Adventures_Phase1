"use client";

import { useEffect } from "react";
// Import the config file to trigger the Sentry.init() call on the client
import "../sentry.client.config";

/**
 * SentryInitializer - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export function SentryInitializer() {
  useEffect(() => {
    // Sentry initialized via import side-effect
  }, []);
  return null;
}
