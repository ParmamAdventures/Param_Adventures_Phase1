"use client";

import { Button } from "@/components/ui/Button";

export default function SentryTestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-3xl font-bold">Sentry Verification</h1>
      <p>Click the button below to crash the app intentionally.</p>
      
      <Button
        variant="danger"
        onClick={() => {
          throw new Error("Sentry Test Error: Frontend is Watching! 👁️");
        }}
      >
        Trigger Test Error
      </Button>
    </div>
  );
}
