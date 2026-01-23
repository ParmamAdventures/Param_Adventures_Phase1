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
  const [error, setError] = useState<string | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
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

          const json = await res.json();
          // Debugging
          console.log("[Polling] /bookings/me response:", json);

          let bookings: any[] = [];
          if (Array.isArray(json)) {
            bookings = json;
          } else if (json.data && Array.isArray(json.data)) {
            bookings = json.data;
          } else {
            console.warn("[Polling] Unexpected response format:", json);
            return;
          }

          const booking = bookings.find((b: any) => b.id === bookingId);

          if (booking?.paymentStatus === "PAID") {
            clearPolling();
            setMessage("Payment successful! 🎉");
            setIsLoading(false);
            showToast("Payment verified successfully", "success");
            router.refresh();
          } else if (booking?.paymentStatus === "FAILED") {
            clearPolling();
            const errMsg = "Payment failed. Please try again.";
            setMessage(errMsg);
            setError(errMsg);
            setIsLoading(false);
            showToast("Payment verification failed", "error");
          } else if (attempts >= maxAttempts) {
            clearPolling();
            const errMsg =
              "Verification taking longer than expected. Please check 'My Bookings' or retry.";
            setMessage(errMsg);
            setError(errMsg);
            setIsLoading(false);
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
      setLastBookingId(bookingId);
      setIsLoading(true);
      setMessage("Initializing payment...");
      setError(null);

      try {
        const res = await apiFetch("/payments/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          const msg =
            errorData.error?.message || errorData.message || "Failed to create payment intent";
          throw new Error(msg);
        }

        const data = await res.json();
        const orderId = data.orderId;

        // Handle dev fallback
        if (orderId.startsWith("order_test_")) {
          setMessage("Dev order created. Click 'Simulate' to finish.");
          setIsLoading(false);
          setIsDevMode(true);
          return { isDev: true, orderId };
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
            },
          },
        };

        const rzp = new Razorpay(options);
        rzp.open();
      } catch (error: any) {
        console.error("Payment error:", error);
        const errMsg = error.message || "Payment failed to start";
        setMessage(errMsg);
        setError(errMsg);
        showToast(errMsg, "error");
        setIsLoading(false);
      }
      return { isDev: false };
    },
    [loadScript, showToast, startPolling],
  );

  const simulateDevSuccess = useCallback(
    async (bookingId: string, orderId?: string) => {
      setMessage("Simulating success. Verifying...");
      setIsLoading(true);
      setError(null);

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

  const retryVerification = useCallback(async () => {
    if (!lastBookingId) return;
    setIsLoading(true);
    setError(null);
    setMessage("Retrying verification...");
    startPolling(lastBookingId);
  }, [lastBookingId, startPolling]);

  return {
    initiatePayment,
    simulateDevSuccess,
    retryVerification,
    isLoading,
    message,
    error,
    setMessage,
    setError,
    isDevMode,
  };
}
