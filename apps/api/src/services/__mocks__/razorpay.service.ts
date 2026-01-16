// Manual mock for Razorpay service to enable proper test isolation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const razorpayService: any = {
  createOrder: jest.fn(),
  verifyPaymentSignature: jest.fn(),
  verifyWebhookSignature: jest.fn(),
  refundPayment: jest.fn(),
};

export function resetRazorpayInstance() {
  // Reset all mocks
  jest.clearAllMocks();
}
