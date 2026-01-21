import { useState, useCallback, useRef } from "react";
import { apiFetch } from "../lib/api";
import { useToast } from "../components/ui/ToastProvider";
import { useRouter } from "next/navigation";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
  prefill?: {
    name?: string;
    email?: string;
  };
  theme: {
    color: string;
  };
}

interface WindowWithRazorpay extends Window {
  Razorpay?: new (options: RazorpayOptions) => { open: () => void };
}

/**
 * Razorpay payment hook for handling payment initialization and verification.
 * @returns {Object} Payment functions and state (initiatePayment, verifyPayment, etc.)
 */
export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  const loadScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as WindowWithRazorpay).Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Ref to store promises for current payment flow
  const paymentPromiseRef = useRef<{ resolve: (value: any) => void; reject: (reason?: any) => void } | null>(null);

  const startPolling = useCallback(
    (bookingId: string) => {
      clearPolling();
      let attempts = 0;
      const maxAttempts = 20;

      pollIntervalRef.current = setInterval(async () => {
        attempts++;
        try {
          const res = await apiFetch("/bookings/me");
          if (!res.ok) return;

          const bookings = await res.json();
          const booking = bookings.find((b: any) => b.id === bookingId);

          if (booking?.paymentStatus === "PAID") {
            clearPolling();
            setMessage("Payment successful! 🎉");
            setIsLoading(false);
            showToast("Payment verified successfully", "success");
            router.refresh();
            if (paymentPromiseRef.current) paymentPromiseRef.current.resolve(true);
          } else if (booking?.paymentStatus === "FAILED") {
            clearPolling();
            setMessage("Payment failed. Please try again.");
            setIsLoading(false);
            showToast("Payment verification failed", "error");
            if (paymentPromiseRef.current) paymentPromiseRef.current.reject(new Error("Payment failed verification"));
          } else if (attempts >= maxAttempts) {
            clearPolling();
            setMessage("Payment received but confirmation delayed. Contact support if not resolved in 5 min.");
            setIsLoading(false);
            // Don't reject, just warn, as it might succeed later. User can close modal.
            showToast("Confirmation delayed. Check email for updates.", "warning");
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);
    },
    [clearPolling, router, showToast],
  );

  const initiatePayment = useCallback(
    async (bookingId: string, user?: { name?: string; email?: string }) => {
      setIsLoading(true);
      setMessage("Initializing payment...");

      return new Promise(async (resolve, reject) => {
        paymentPromiseRef.current = { resolve, reject };

        try {
          const res = await apiFetch("/payments/intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            const msg = errorData.error?.message || errorData.message || "Failed to create payment intent";
            throw new Error(msg);
          }

          const data = await res.json();
          const orderId = data.orderId;

          // Handle dev fallback
          if (orderId.startsWith("order_test_")) {
            setMessage("Dev order created. Click 'Simulate' to finish.");
            setIsLoading(false);
            resolve({ isDev: true, orderId });
            return;
          }

          const scriptLoaded = await loadScript();
          if (!scriptLoaded) {
            throw new Error("Failed to load Razorpay SDK");
          }

          const Razorpay = (window as WindowWithRazorpay).Razorpay!;
          const accentColor =
            getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
            "#FF6A00";

          const options: RazorpayOptions = {
            key: data.key,
            amount: data.amount,
            currency: data.currency || "INR",
            order_id: orderId,
            name: "Param Adventures",
            description: "Trip Booking Payment",
            prefill: {
              name: user?.name,
              email: user?.email,
            },
            theme: {
              color: accentColor,
            },
            handler: async (response: any) => {
              setMessage("Payment received. Verifying...");
              setIsLoading(true);
              try {
                const verifyRes = await apiFetch("/payments/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                  }),
                });

                if (verifyRes.ok) {
                  setMessage("Payment successful! 🎉");
                  setIsLoading(false);
                  showToast("Payment verified successfully", "success");
                  router.refresh();
                  resolve(true);
                } else {
                  startPolling(bookingId);
                }
              } catch (error) {
                console.error("Verification error:", error);
                startPolling(bookingId);
              }
            },
            modal: {
              ondismiss: () => {
                setMessage("Payment cancelled");
                setIsLoading(false);
                reject(new Error("Payment cancelled by user"));
              },
            },
          };

          const rzp = new Razorpay(options);
          rzp.open();
        } catch (error: any) {
          console.error("Payment error:", error);
          setMessage(error.message || "Payment failed to start");
          showToast(error.message || "Payment failed", "error");
          setIsLoading(false);
          reject(error);
        }
      });
    },
    [loadScript, showToast, startPolling],
  );

  const simulateDevSuccess = useCallback(
    async (bookingId: string, orderId?: string) => {
      setMessage("Simulating success. Verifying...");
      setIsLoading(true);

      if (orderId) {
        try {
          const verifyRes = await apiFetch("/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });

          if (verifyRes.ok) {
            setMessage("Payment successful! 🎉");
            setIsLoading(false);
            showToast("Payment verified successfully", "success");
            router.refresh();
            return;
          }
        } catch (error) {
          console.error("Simulation verification error:", error);
        }
      }

      startPolling(bookingId);
    },
    [startPolling, router, showToast],
  );

  return {
    initiatePayment,
    simulateDevSuccess,
    isLoading,
    message,
    setMessage,
  };
}
