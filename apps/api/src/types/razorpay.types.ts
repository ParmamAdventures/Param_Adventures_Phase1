/**
 * Razorpay Webhook Event Types
 * Type definitions for Razorpay webhook payloads
 */

export type PaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "refunded"
  | "failed"
  | "partially_refunded";

export type RefundStatus = "created" | "processed" | "failed";

export interface RazorpayPaymentEntity {
  id: string;
  entity: "payment";
  amount: number;
  currency: string;
  status: PaymentStatus;
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  customer_id: string | null;
  notes: Record<string, unknown>;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  acquirer_data: Record<string, unknown>;
  created_at: number;
}

export interface RazorpayRefundEntity {
  id: string;
  entity: "refund";
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, unknown>;
  receipt: string | null;
  acquirer_data: Record<string, unknown>;
  created_at: number;
  batch_id: string | null;
  status: RefundStatus;
  speed_processed: string;
  speed_requested: string;
}

export interface RazorpayDisputeEntity {
  id: string;
  entity: "dispute";
  payment_id: string;
  amount: number;
  currency: string;
  amount_deducted: number;
  reason_code: string;
  respond_by: number;
  status: "open" | "closed" | "under_review";
  phase: "chargeback" | "pre_arbitration" | "arbitration";
  created_at: number;
  evidence: unknown;
  comments: unknown[];
}

export interface RazorpayWebhookEventBase<T = unknown> {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: T;
    };
    refund?: {
      entity: RazorpayRefundEntity;
    };
    dispute?: {
      entity: RazorpayDisputeEntity;
    };
  };
  created_at: number;
}

// Specific event types
export type PaymentCapturedEvent = RazorpayWebhookEventBase<RazorpayPaymentEntity> & {
  event: "payment.captured" | "order.paid";
  contains: ["payment"];
};

export type PaymentFailedEvent = RazorpayWebhookEventBase<RazorpayPaymentEntity> & {
  event: "payment.failed";
  contains: ["payment"];
};

export type PaymentAuthorizedEvent = RazorpayWebhookEventBase<RazorpayPaymentEntity> & {
  event: "payment.authorized";
  contains: ["payment"];
};

export type RefundCreatedEvent = RazorpayWebhookEventBase & {
  event: "refund.created";
  contains: ["refund"];
};

export type RefundProcessedEvent = RazorpayWebhookEventBase & {
  event: "refund.processed";
  contains: ["refund"];
};

export type DisputeCreatedEvent = RazorpayWebhookEventBase & {
  event: "dispute.created";
  contains: ["dispute"];
};

export type DisputeClosedEvent = RazorpayWebhookEventBase & {
  event: "dispute.closed";
  contains: ["dispute"];
};

// Union type for all possible webhook events
export type RazorpayWebhookEvent =
  | PaymentCapturedEvent
  | PaymentFailedEvent
  | PaymentAuthorizedEvent
  | RefundCreatedEvent
  | RefundProcessedEvent
  | DisputeCreatedEvent
  | DisputeClosedEvent;

// Type guard helpers
export function isPaymentEvent(
  event: RazorpayWebhookEvent,
): event is PaymentCapturedEvent | PaymentFailedEvent | PaymentAuthorizedEvent {
  return event.contains.includes("payment");
}

export function isRefundEvent(
  event: RazorpayWebhookEvent,
): event is RefundCreatedEvent | RefundProcessedEvent {
  return event.contains.includes("refund");
}

export function isDisputeEvent(
  event: RazorpayWebhookEvent,
): event is DisputeCreatedEvent | DisputeClosedEvent {
  return event.contains.includes("dispute");
}
