type WebhookMetrics = {
  total: number;
  processed: number;
  replay: number;
  failed: number;
  lastLatencyMs?: number;
};

const metrics: WebhookMetrics = {
  total: 0,
  processed: 0,
  replay: 0,
  failed: 0,
};

export function incTotal() {
  metrics.total++;
}

export function incProcessed() {
  metrics.processed++;
}

export function incReplay() {
  metrics.replay++;
}

export function incFailed() {
  metrics.failed++;
}

export function setLatency(ms: number) {
  metrics.lastLatencyMs = ms;
}

export function getWebhookMetrics() {
  return { ...metrics } as WebhookMetrics;
}
