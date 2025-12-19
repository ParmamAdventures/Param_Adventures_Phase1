export function logWebhookReplay(data: {
  provider: string;
  event: string;
  paymentId: string;
  providerPaymentId?: string | null;
}) {
  // Structured, machine-readable log for webhook replays
  try {
    console.info("[Webhook][Replay]", {
      ...data,
      receivedAt: new Date().toISOString(),
    });
  } catch (e) {
    // Avoid throwing during webhook handling
    console.error("[Webhook][Replay] log failed", e);
  }
}
