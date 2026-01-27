/**
 * Booking-related types
 */

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  startDate: string | Date;
  endDate?: string | Date;
  guests: number;
  totalPrice: number;
  status: "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  guestDetails?: GuestDetail[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface GuestDetail {
  name: string;
  email: string;
  age?: number;
  gender?: string;
  phoneNumber?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  provider: "RAZORPAY" | "STRIPE" | "PAYPAL";
  providerOrderId: string;
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "CAPTURED" | "FAILED" | "REFUNDED";
  method?: string;
  createdAt: string | Date;
}

export interface Invoice {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "PAID" | "CANCELLED";
  pdfUrl?: string;
  createdAt: string | Date;
}
