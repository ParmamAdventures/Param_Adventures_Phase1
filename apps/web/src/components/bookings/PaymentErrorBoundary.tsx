"use client";

import React from "react";
import Button from "../ui/Button";

interface Props {
  error: string | null;
  onRetry: () => void;
  onSupport: () => void;
}

/**
 * PaymentErrorBoundary - UI for handling payment-related errors with retry and support options.
 */
export default function PaymentErrorBoundary({ error, onRetry, onSupport }: Props) {
  if (!error) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center duration-300">
      <div className="mb-4 flex flex-col items-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
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
        <h3 className="text-lg font-bold text-red-500">Payment Verification Failed</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {error.includes("timeout")
            ? "We are having trouble verifying your payment status. It might take a few minutes."
            : error}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={onRetry} className="flex-1 bg-red-500 text-white hover:bg-red-600">
          Retry Verification
        </Button>
        <Button variant="outline" onClick={onSupport} className="flex-1">
          Contact Support
        </Button>
      </div>

      <p className="text-muted-foreground mt-4 text-[10px] italic">
        If money was deducted from your account, don&apos;t worry. Our team will verify it manually
        if needed.
      </p>
    </div>
  );
}
