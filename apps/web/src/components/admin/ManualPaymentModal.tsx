import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { apiFetch } from "../../lib/api";
import { useToast } from "../ui/ToastProvider";
import { ImageUploader } from "../media/ImageUploader";
import { useAsyncOperation } from "../../hooks/useAsyncOperation";
import { useFormState } from "../../hooks/useFormState";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: any | null;
  onSuccess: () => void;
}

/**
 * ManualPaymentModal - Modal for recording manual payments.
 * Uses useAsyncOperation for submission state and useFormState for form management.
 *
 * @param {Props} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Object} props.booking - Booking details
 * @param {Function} props.onSuccess - Success callback
 * @returns {React.ReactElement} Modal component
 *
 * @example
 * <ManualPaymentModal isOpen={true} booking={booking} onClose={() => {}} onSuccess={() => {}} />
 */
export default function ManualPaymentModal({ isOpen, onClose, booking, onSuccess }: Props) {
  const { showToast } = useToast();
  const { state, execute } = useAsyncOperation();
  const {
    values: formData,
    setField,
    reset: resetForm,
  } = useFormState({
    amount: "",
    method: "UPI",
    transactionId: "",
    proofUrl: "",
  });

  // Auto-fill amount when booking opens
  useEffect(() => {
    if (booking && isOpen) {
      setField("amount", booking.totalPrice.toString());
      setField("proofUrl", "");
      setField("transactionId", "");
    }
  }, [booking, isOpen, setField]);

  const handleSubmit = async () => {
    if (!booking) return;
    if (!formData.amount || !formData.method) {
      showToast("Please fill required fields", "error");
      return;
    }

    await execute(async () => {
      const res = await apiFetch("/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: Number(formData.amount) * 100,
          method: formData.method,
          transactionId: formData.transactionId,
          proofUrl: formData.proofUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to record payment");

      showToast("Payment recorded successfully", "success");
      resetForm();
      onSuccess();
      onClose();
      return res.json();
    });
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-muted/30 rounded-lg p-3 text-sm">
            <p>
              <strong>Booking:</strong> {booking.trip.title}
            </p>
            <p>
              <strong>User:</strong> {booking.user.name}
            </p>
            <p>
              <strong>Total Due:</strong> ₹{booking.totalPrice.toLocaleString()}
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Payment Method</label>
            <select
              className="bg-background w-full rounded-md border p-2 text-sm"
              value={formData.method}
              onChange={(e) => setField("method", e.target.value)}
            >
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Amount Received (₹)</label>
            <input
              type="number"
              className="bg-background w-full rounded-md border p-2 text-sm"
              value={formData.amount}
              onChange={(e) => setField("amount", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Transaction ID / Reference (Optional)</label>
            <input
              type="text"
              className="bg-background w-full rounded-md border p-2 text-sm"
              value={formData.transactionId}
              onChange={(e) => setField("transactionId", e.target.value)}
              placeholder="e.g. UPI/UTR Number"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Upload Proof (Screenshot)</label>
            <div className="h-32">
              {formData.proofUrl ? (
                <div className="relative h-full w-full">
                  <img
                    src={formData.proofUrl}
                    alt="Proof"
                    className="h-full w-auto rounded-lg object-cover"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setField("proofUrl", "")}
                    className="absolute top-2 right-2 h-6 px-2 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <ImageUploader
                  onUpload={(img) => setField("proofUrl", img.originalUrl)}
                  label="Upload Screenshot"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={onClose} disabled={state.status === "loading"}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={state.status === "loading"}
              disabled={state.status === "loading"}
            >
              Confirm Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
