
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

export function useRazorpay() {
  const [loading, setLoading] = useState(false);
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

  const startPolling = useCallback((bookingId: string) => {
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
          setLoading(false);
          showToast("Payment verified successfully", "success");
          router.refresh();
        } else if (booking?.paymentStatus === "FAILED") {
          clearPolling();
          setMessage("Payment failed. Please try again.");
          setLoading(false);
          showToast("Payment verification failed", "error");
        } else if (attempts >= maxAttempts) {
          clearPolling();
          setMessage("Verification taking longer than expected. Please refresh.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);
  }, [clearPolling, router, showToast]);

  const initiatePayment = useCallback(async (bookingId: string, user?: { name?: string; email?: string }) => {
    setLoading(true);
    setMessage("Initializing payment...");

    try {
      const res = await apiFetch("/payments/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create payment intent");
      }

      const data = await res.json();
      const orderId = data.orderId;

      // Handle dev fallback
      if (orderId.startsWith("order_test_")) {
        setMessage("Dev order created. Click 'Simulate' to finish.");
        setLoading(false);
        return { isDev: true, orderId };
      }

      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      const Razorpay = (window as WindowWithRazorpay).Razorpay!;
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#FF6A00";

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
        handler: () => {
          setMessage("Payment received. Verifying...");
          setLoading(true);
          startPolling(bookingId);
        },
        modal: {
          ondismiss: () => {
            setMessage("Payment cancelled");
            setLoading(false);
          },
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      setMessage(error.message || "Payment failed to start");
      showToast(error.message || "Payment failed", "error");
      setLoading(false);
    }
    return { isDev: false };
  }, [loadScript, showToast, startPolling]);

  const simulateDevSuccess = useCallback((bookingId: string) => {
    setMessage("Simulating success. Verifying...");
    setLoading(true);
    startPolling(bookingId);
  }, [startPolling]);

  return {
    initiatePayment,
    simulateDevSuccess,
    loading,
    message,
    setMessage,
  };
}
