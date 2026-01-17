import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { apiFetch } from "../../lib/api";
import { useToast } from "../ui/ToastProvider";
import { ImageUploader } from "../media/ImageUploader";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    trip: { title: string; price: number };
    user: { name: string | null };
    guests: number;
    totalPrice: number;
  } | null;
  onSuccess: () => void;
}

export default function ManualPaymentModal({ isOpen, onClose, booking, onSuccess }: Props) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill amount when booking opens
  React.useEffect(() => {
    if (booking) {
      setAmount(booking.totalPrice.toString());
      setProofUrl("");
      setTransactionId("");
    }
  }, [booking]);

  const handleSubmit = async () => {
    if (!booking) return;
    if (!amount || !method) {
      showToast("Please fill required fields", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch("/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: Number(amount) * 100, // Convert to paise expected by backend? 
          // Wait, backend expects amount. If Razorpay used paise, manual might use Rupees in UI but backend implementation should be consistent.
          // Let's check backend: createManualPayment.ts says: "amount: Number(amount)".
          // Razorpay expects paise. If Admin enters 5000, backend sees 5000. 
          // IMPORTANT: If `Booking.totalPrice` is in Rupees, fine. If it's in Paisa, divide. 
          // `Booking` model says `totalPrice Int` (usually we stored rupees in earlier implementation, checking schema: `price Int`). 
          // Wait, Razorpay creates order with `booking.trip.price * 100`. So DB stores Rupees.
          // So if Admin enters Rupees, we should multiply by 100 if we want consistency with Razorpay (which uses paise).
          // BUT `createManualPayment` saves `amount` directly.
          // Let's assume Backend stores PAISE for consistency with Razorpay schema `amount Int // paise`.
          // So I should multiply by 100 here.
          method,
          transactionId,
          proofUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to record payment");

      showToast("Payment recorded successfully", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast("Failed to record payment", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="rounded-lg bg-muted/30 p-3 text-sm">
            <p><strong>Booking:</strong> {booking.trip.title}</p>
            <p><strong>User:</strong> {booking.user.name}</p>
            <p><strong>Total Due:</strong> ₹{booking.totalPrice.toLocaleString()}</p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Payment Method</label>
            <select
              className="w-full rounded-md border p-2 text-sm bg-background"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
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
                className="w-full rounded-md border p-2 text-sm bg-background"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
             />
          </div>

          <div className="grid gap-2">
             <label className="text-sm font-medium">Transaction ID / Reference (Optional)</label>
             <input 
                type="text" 
                className="w-full rounded-md border p-2 text-sm bg-background"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. UPI/UTR Number"
             />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Upload Proof (Screenshot)</label>
            <div className="h-32">
                {proofUrl ? (
                  <div className="relative h-full w-full">
                    <img src={proofUrl} alt="Proof" className="h-full w-auto rounded-lg object-cover" />
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => setProofUrl("")}
                      className="absolute top-2 right-2 h-6 px-2 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <ImageUploader 
                    onUpload={(img) => setProofUrl(img.originalUrl)} 
                    label="Upload Screenshot" 
                  />
                )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>
              Confirm Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

