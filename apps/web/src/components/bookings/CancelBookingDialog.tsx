
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface CancelBookingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    bookingTitle: string;
}

export default function CancelBookingDialog({ isOpen, onClose, onConfirm, bookingTitle }: CancelBookingDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <AlertTriangle size={24} />
                        <DialogTitle>Cancel Booking?</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to cancel your booking for <span className="font-bold text-foreground">{bookingTitle}</span>? 
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Keep Booking
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleConfirm} 
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                        Yes, Cancel It
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
