"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import Link from "next/link";
import { useToast } from "../../components/ui/ToastProvider";
import TripStatusBadge from "../../components/trips/TripStatusBadge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ErrorBlock from "../../components/ui/ErrorBlock";
import Spinner from "../../components/ui/Spinner";

type Booking = {
  id: string;
  status: string;
  createdAt: string;
  paymentStatus?: string | null;
  trip: {
    id: string;
    title: string;
    slug: string;
    location: string;
    startDate?: string | null;
    endDate?: string | null;
  };
};

type WindowWithPaynow = Window & {
  __paynow_poll_id?: number | null;
  Razorpay?: {
    new (opts: unknown): { open: () => void };
  };
};

export default function MyBookingsPage() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await apiFetch("/bookings/me");
        if (!res.ok) {
          setError("Failed to load bookings");
          setBookings([]);
          return;
        }
        const data = await res.json();
        if (!cancelled) setBookings(data);
      } catch {
        if (!cancelled) setError("Network error");
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  if (loading)
    return (
      <div className="py-12 text-center">
        <Spinner size={24} />
      </div>
    );

  if (!user) {
    return <div>Please sign in to view your bookings.</div>;
  }

  if (error) return <ErrorBlock>{error}</ErrorBlock>;

  if (bookings && bookings.length === 0) {
    return (
      <Card className="text-center py-16">
        <h3 className="text-lg font-semibold">No bookings yet</h3>
        <p className="text-[var(--muted)] mt-2">
          Explore trips and join your first adventure.
        </p>
        <div className="mt-4">
          <Link href="/trips">
            <Button>Explore Trips</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <h1>My Bookings</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Trip</th>
            <th>Dates</th>
            <th>Location</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings?.map((b) => (
            <tr key={b.id} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "8px 4px" }}>
                <Link href={`/trips/${b.trip.slug}`}>{b.trip.title}</Link>
              </td>
              <td style={{ textAlign: "center" }}>
                {b.trip.startDate && b.trip.endDate
                  ? `${new Date(b.trip.startDate).toLocaleDateString()} - ${new Date(
                      b.trip.endDate
                    ).toLocaleDateString()}`
                  : "—"}
              </td>
              <td style={{ textAlign: "center" }}>{b.trip.location}</td>
              <td style={{ textAlign: "center" }}>
                <TripStatusBadge status={b.status} />
              </td>
              <td style={{ textAlign: "center" }}>
                {b.paymentStatus || "PENDING"}
              </td>
              <td style={{ textAlign: "center" }}>
                {b.status === "CONFIRMED" &&
                (b.paymentStatus === "PENDING" || !b.paymentStatus) ? (
                  <PayNowButton bookingId={b.id} />
                ) : (
                  <Button disabled variant="subtle" style={{ opacity: 0.6 }}>
                    {b.paymentStatus === "PAID" ? "Paid ✅" : "—"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PayNowButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [intent, setIntent] = React.useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    key?: string;
  } | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const pollRef = React.useRef<number | null>(null);
  const { showToast } = useToast();

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/payments/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg =
          body?.error?.message || body?.message || `Error ${res.status}`;
        setError(msg);
        try {
          showToast(msg, "error");
        } catch {}
        return;
      }

      const data = await res.json();
      // store safe intent for next phase (do not store signatures)
      setIntent({
        paymentId: data.paymentId || data.id || "",
        orderId: data.orderId || data.providerOrderId || "",
        amount: data.amount,
        currency: data.currency || "INR",
        key: data.key,
      });
      // After intent created, decide whether to open checkout or show dev controls
      const orderId = data.orderId || data.providerOrderId || "";
      const startPolling = startPollingFactory(
        bookingId,
        setMessage,
        setLoading,
        router
      );

      // If this is a dev fallback order, DO NOT open Razorpay modal (it will block the UI).
      // Instead show the simulate button so QA can complete the flow locally.
      if (orderId.startsWith("order_test_")) {
        setMessage(
          "Dev order created — use 'Simulate success (dev)' to finish."
        );
        // keep intent visible (simulate button will be rendered)
      } else {
        openCheckout(
          {
            paymentId: data.paymentId || data.id || "",
            orderId,
            amount: data.amount,
            currency: data.currency || "INR",
            key: data.key,
          },
          {
            onSuccess: () => {
              setMessage("Payment received. Verifying…");
              // disable button visually
              setLoading(true);
              // start polling bookings for paymentStatus update
              startPolling();
            },
            onDismiss: () => setMessage("Payment cancelled"),
            onError: () => setMessage("Payment failed to start"),
          },
          // prefill
          { name: user?.name, email: user?.email }
        );
      }
      // Keep UX conservative: show a transient success message (no checkout yet)
      try {
        showToast("Payment initiated", "info");
      } catch {}
    } catch (e) {
      const err = String(e);
      setError(err);
      try {
        showToast("Payment failed to start", "error");
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "inline-block" }}>
      <Button onClick={handleClick} loading={loading}>
        {loading ? "Preparing payment…" : "Pay Now"}
      </Button>
      {error && <ErrorBlock>{error}</ErrorBlock>}
      {intent && (
        <div
          style={{ marginTop: 6, fontSize: 13, color: "var(--semantic-info)" }}
        >
          Payment ready — order {intent.orderId ?? intent.paymentId}
        </div>
      )}
      {intent && intent.orderId?.startsWith("order_test_") && (
        <div style={{ marginTop: 6 }}>
          <Button
            variant="subtle"
            onClick={() => {
              // developer convenience: simulate success for dev fallback orders
              setMessage("Payment received. Verifying…");
              setLoading(true);
              const startPolling = startPollingFactory(
                bookingId,
                setMessage,
                setLoading,
                router
              );
              startPolling();
            }}
            style={{ marginTop: 6, fontSize: 13 }}
          >
            Simulate success (dev)
          </Button>
        </div>
      )}
      {message && (
        <div
          className="paynow-message"
          style={{ marginTop: 6, fontSize: 13, color: "var(--semantic-info)" }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

function startPollingFactory(
  bookingId: string,
  setMessage: (m: string | null) => void,
  setLoading: (v: boolean) => void,
  router: ReturnType<typeof useRouter>
) {
  return function startPolling() {
    let attempts = 0;
    // clear any existing poll
    if (pollHandleExists()) clearPoll();

    const id = window.setInterval(async () => {
      attempts++;
      try {
        const res = await apiFetch("/bookings/me");
        if (!res.ok) {
          // ignore and retry
          return;
        }
        const bookings: Booking[] = await res.json();
        const updated = bookings.find((b: Booking) => b.id === bookingId);
        if (!updated) return;

        if (updated.paymentStatus === "PAID") {
          clearInterval(id);
          setMessage("Payment successful 🎉");
          setLoading(false);
          try {
            router.refresh();
          } catch {}
          return;
        }

        if (updated.paymentStatus === "FAILED") {
          clearInterval(id);
          setMessage("Payment failed. Please retry.");
          setLoading(false);
          return;
        }

        if (attempts >= 10) {
          clearInterval(id);
          setMessage("Payment pending confirmation. It may take a minute.");
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore network errors and continue
      }
    }, 3000);

    // store poll id on window for potential cleanup
    (window as WindowWithPaynow).__paynow_poll_id = id;
  };

  function clearPoll() {
    const w = window as WindowWithPaynow;
    const existing = w.__paynow_poll_id;
    if (existing) {
      clearInterval(existing as number);
      w.__paynow_poll_id = null;
    }
  }

  function pollHandleExists() {
    return !!(window as WindowWithPaynow).__paynow_poll_id;
  }
}

// Load Razorpay script once
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as WindowWithPaynow).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function openCheckout(
  intent: {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    key?: string;
  },
  callbacks?: {
    onSuccess?: () => void;
    onDismiss?: () => void;
    onError?: () => void;
  },
  prefill?: { name?: string; email?: string }
) {
  const ok = await loadRazorpay();
  if (!ok) {
    try {
      callbacks?.onError?.();
      alert("Failed to load payment gateway");
    } catch {}
    return;
  }

  const options = {
    key: intent.key || "",
    amount: intent.amount,
    currency: intent.currency,
    order_id: intent.orderId,
    name: "Param Adventures",
    description: "Trip booking payment",
    handler: function (response: unknown) {
      try {
        callbacks?.onSuccess?.();
        const el = document.querySelector(".paynow-message");
        if (el) el.textContent = "Payment received. Verifying…";
        else console.info("Payment received. Verifying…");
      } catch {}
    },
    modal: {
      ondismiss: function () {
        try {
          callbacks?.onDismiss?.();
          const el = document.querySelector(".paynow-message");
          if (el) el.textContent = "Payment cancelled";
          else console.info("Payment cancelled");
        } catch {}
      },
    },
    prefill: { name: prefill?.name, email: prefill?.email },
    // use CSS token for accent so theme color follows design token
    theme: {
      color: (
        getComputedStyle(document.documentElement).getPropertyValue(
          "--accent"
        ) || "#FF6A00"
      ).trim(),
    },
  } as unknown;

  // Create instance using typed window to avoid `any`
  const RazorpayCtor = (window as WindowWithPaynow).Razorpay;
  if (!RazorpayCtor) {
    callbacks?.onError?.();
    return;
  }
  new RazorpayCtor(options).open();
}
