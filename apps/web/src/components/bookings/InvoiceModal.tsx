
"use client";

import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Printer, Download } from "lucide-react";
import { useReactToPrint } from "react-to-print"; // Note: Might need to install this or use window.print()

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
}

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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:shadow-none print:border-none print:max-w-none print:max-h-none print:fixed print:inset-0 print:z-[9999] print:bg-white print:p-0">
               
                {/* No-Print Header */}
                <DialogHeader className="print:hidden flex flex-row items-center justify-between border-b pb-4">
                    <DialogTitle>Invoice</DialogTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer size={16} className="mr-2" /> Print / Save PDF
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
                    </div>
                </DialogHeader>

                {/* Printable Content */}
                <div ref={componentRef} className="p-8 bg-white text-black print:p-0 print:w-full" id="invoice-content">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight mb-2">INVOICE</h1>
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
                            <div className="text-2xl font-black italic tracking-tighter uppercase mb-4 text-black">
                                PARAM ADVENTURES
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p>Date: {new Date(booking.createdAt).toLocaleDateString()}</p>
                                <p className="font-bold text-black uppercase mt-2">Bill To:</p>
                                <p>{booking.user?.name || "Traveler"}</p>
                                <p>{booking.user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Trip Details */}
                    <div className="mb-12">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2">Trip Details</h2>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-1">{booking.trip.title}</h3>
                                <p className="text-sm text-gray-600">{booking.trip.location}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm"><span className="font-semibold">Start Date:</span> {new Date(booking.startDate).toLocaleDateString()}</p>
                                <p className="text-sm"><span className="font-semibold">Guests:</span> {booking.guests}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Table */}
                    <div className="mb-12">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="py-2 text-sm font-black uppercase">Description</th>
                                    <th className="py-2 text-sm font-black uppercase text-right">Qty</th>
                                    <th className="py-2 text-sm font-black uppercase text-right">Unit Price</th>
                                    <th className="py-2 text-sm font-black uppercase text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="py-4">
                                        <p className="font-bold">Expedition Fee</p>
                                        <p className="text-xs text-gray-500">{booking.trip.durationDays} Days - {booking.trip.difficulty}</p>
                                    </td>
                                    <td className="py-4 text-right">1</td>
                                    <td className="py-4 text-right">₹{booking.totalPrice.toLocaleString()}</td>
                                    <td className="py-4 text-right">₹{booking.totalPrice.toLocaleString()}</td>
                                </tr>
                            </tbody>
                            <tfoot className="border-t-2 border-black">
                                <tr>
                                    <td colSpan={3} className="py-4 text-right font-bold">Subtotal</td>
                                    <td className="py-4 text-right">₹{booking.totalPrice.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="py-2 text-right font-bold text-gray-500 text-sm">Tax (Included)</td>
                                    <td className="py-2 text-right text-gray-500 text-sm">₹0</td>
                                </tr>
                                <tr className="text-lg">
                                    <td colSpan={3} className="py-4 text-right font-black">TOTAL</td>
                                    <td className="py-4 text-right font-black">₹{booking.totalPrice.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-400 mt-20 border-t pt-8">
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
                        #invoice-content, #invoice-content * {
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
