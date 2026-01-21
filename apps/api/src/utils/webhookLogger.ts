/**
 * Log webhook replay detection (idempotency).
 * Records when a duplicate webhook is received and skipped.
 * @param {Object} data - Webhook replay information
 * @param {string} data.provider - Payment provider (razorpay, etc)
 * @param {string} data.event - Webhook event type
 * @param {string} data.paymentId - Internal payment ID
 * @param {string} [data.providerPaymentId] - External provider payment ID
 * @returns {void}
 */
export function logWebhookReplay(data: {
  provider: string;
  event: string;
  paymentId: string;
  providerPaymentId?: string | null;
  metadata?: any;
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
