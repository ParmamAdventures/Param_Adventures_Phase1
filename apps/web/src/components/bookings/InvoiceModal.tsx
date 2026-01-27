"use client";

import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Printer } from "lucide-react";
import { Booking } from "@/types/booking";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

/**
 * InvoiceModal - Modal dialog component for user interactions.
 * @param {Object} props - Component props
 * @param {boolean} [props.isOpen] - Whether modal is open
 * @param {Function} [props.onClose] - Callback when modal closes
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} [props.children] - Modal content
 * @returns {React.ReactElement} Modal component
 */
export default function InvoiceModal({ isOpen, onClose, booking }: InvoiceModalProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // Create a printable window or use print styles
    // Simpler approach: a print-only style block in the modal?
    // Actually, let's just use window.print() but we need to hide everything else.
    // A better way often used in React is opening a new window with the content, or using a library.
    // Let's stick to a simple strategy: CSS @media print.
    // When printing, we'll only show the invoice content.
    window.print();
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Widen the modal for invoice view */}
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto print:fixed print:inset-0 print:z-[9999] print:max-h-none print:max-w-none print:border-none print:bg-white print:p-0 print:shadow-none">
        {/* No-Print Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 print:hidden">
          <DialogTitle>Invoice</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer size={16} className="mr-2" /> Print / Save PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Content */}
        <div
          ref={componentRef}
          className="bg-white p-8 text-black print:w-full print:p-0"
          id="invoice-content"
        >
          {/* Header */}
          <div className="mb-12 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-black tracking-tight">INVOICE</h1>
              <p className="text-sm text-gray-500">#{booking.id.slice(0, 8).toUpperCase()}</p>
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p className="font-bold text-black">Param Adventures Inc.</p>
                <p>123 Mountain View Rd</p>
                <p>Himalayas, HP 175131</p>
                <p>support@paramadventures.com</p>
              </div>
            </div>
            <div className="text-right">
              {/* Logo Placeholder */}
              <div className="mb-4 text-2xl font-black tracking-tighter text-black uppercase italic">
                PARAM ADVENTURES
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Date: {new Date(booking.createdAt).toLocaleDateString()}</p>
                <p className="mt-2 font-bold text-black uppercase">Bill To:</p>
                <p>{booking.user?.name || "Traveler"}</p>
                <p>{booking.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="mb-12">
            <h2 className="mb-4 border-b pb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              Trip Details
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="mb-1 text-xl font-bold">{booking.trip.title}</h3>
                <p className="text-sm text-gray-600">{booking.trip.location}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  <span className="font-semibold">Start Date:</span>{" "}
                  {new Date(booking.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Guests:</span> {booking.guests}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Table */}
          <div className="mb-12">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-2 text-sm font-black uppercase">Description</th>
                  <th className="py-2 text-right text-sm font-black uppercase">Qty</th>
                  <th className="py-2 text-right text-sm font-black uppercase">Unit Price</th>
                  <th className="py-2 text-right text-sm font-black uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4">
                    <p className="font-bold">Expedition Fee</p>
                    <p className="text-xs text-gray-500">
                      {booking.trip.durationDays} Days - {booking.trip.difficulty}
                    </p>
                  </td>
                  <td className="py-4 text-right">1</td>
                  <td className="py-4 text-right">₹{booking.totalPrice.toLocaleString()}</td>
                  <td className="py-4 text-right">₹{booking.totalPrice.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot className="border-t-2 border-black">
                <tr>
                  <td colSpan={3} className="py-4 text-right font-bold">
                    Subtotal
                  </td>
                  <td className="py-4 text-right">₹{booking.totalPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 text-right text-sm font-bold text-gray-500">
                    Tax (Included)
                  </td>
                  <td className="py-2 text-right text-sm text-gray-500">₹0</td>
                </tr>
                <tr className="text-lg">
                  <td colSpan={3} className="py-4 text-right font-black">
                    TOTAL
                  </td>
                  <td className="py-4 text-right font-black">
                    ₹{booking.totalPrice.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-20 border-t pt-8 text-center text-xs text-gray-400">
            <p>This is a computer-generated invoice.</p>
            <p>Thank you for choosing Param Adventures. We wish you a safe journey.</p>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            /* Hide everything */
            body * {
              visibility: hidden;
            }
            /* Show only the invoice content */
            #invoice-content,
            #invoice-content * {
              visibility: visible;
            }
            #invoice-content {
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              z-index: 9999;
              padding: 20px;
            }
            /* Hide shadcn dialog overlay/portal logic artifacts if they interfere */
            [role="dialog"] {
              box-shadow: none;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
