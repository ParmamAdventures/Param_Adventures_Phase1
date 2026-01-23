"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-full bg-red-500/10 p-4 text-red-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      </div>
      <h1 className="mb-2 text-3xl font-bold">Something went wrong!</h1>
      <p className="text-muted-foreground mb-8 text-lg">
        We apologize for the inconvenience. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-xl bg-[var(--accent)] px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
        >
          Try Again
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-card hover:bg-muted text-card-foreground rounded-xl border border-[var(--border)] px-8 py-3 font-bold shadow-sm transition-all hover:scale-105"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
