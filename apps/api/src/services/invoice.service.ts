import PDFDocument = require("pdfkit");
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import fs from "fs";
import path from "path";

export const invoiceService = {
  async generateInvoice(bookingId: string): Promise<Buffer> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        trip: true,
        user: true,
        payments: {
          where: { status: { in: ["CAPTURED", "REFUNDED"] } }, // Only confirmed payments
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!booking) {
      throw new HttpError(404, "NOT_FOUND", "Booking not found");
    }

    if (booking.paymentStatus !== "PAID" && booking.paymentStatus !== "FAILED") {
      // Technically can generate invoice for PENDING? Usually only for PAID.
      // Let's allow it but mark as UNPAID if needed.
    }

    // Determine the main payment (latest success)
    const mainPayment = booking.payments[0];

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", (buffer: any) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err: any) => reject(err));

      // --- Header ---
      doc.fontSize(20).text("PARAM ADVENTURES", { align: "center" }).moveDown();

      doc.fontSize(10).text("Invoice", { align: "right" });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
      doc.text(`Invoice #: ${mainPayment?.providerOrderId || "DRAFT"}`, { align: "right" });

      doc.moveDown();

      // --- Available To ---
      doc.text(`Billed To:`, { underline: true });
      doc.text(booking.user.name || booking.user.email);
      doc.text(booking.user.email);

      doc.moveDown();
      doc.moveDown();

      // --- Table Header ---
      const tableTop = 250;
      doc.font("Helvetica-Bold");
      doc.text("Description", 50, tableTop);
      doc.text("Quantity", 300, tableTop, { width: 90, align: "right" });
      doc.text("Amount (INR)", 400, tableTop, { width: 100, align: "right" });
      doc.font("Helvetica");

      // --- Table Rows ---
      const items = [
        {
          description: `Trip: ${booking.trip.title} (${booking.startDate.toLocaleDateString()})`,
          quantity: booking.guests,
          amount: booking.totalPrice,
        },
      ];

      let y = tableTop + 25;
      items.forEach((item) => {
        doc.text(item.description, 50, y);
        doc.text(item.quantity.toString(), 300, y, { width: 90, align: "right" });
        doc.text(item.amount.toFixed(2), 400, y, { width: 100, align: "right" });
        y += 20;
      });

      // --- Total ---
      doc.moveDown();
      doc.font("Helvetica-Bold").text(`Total: INR ${booking.totalPrice.toFixed(2)}`, 400, y + 20, {
        width: 100,
        align: "right",
      });

      // --- Status ---
      doc.moveDown();
      doc.fontSize(12).text(`Status: ${booking.paymentStatus}`, 50, y + 50);

      // --- Footer ---
      doc
        .fontSize(10)
        .text(
          "Thank you for choosing Param Adventures. Prepare for the journey of a lifetime!",
          50,
          700,
          { align: "center", width: 500 },
        );

      doc.end();
    });
  },
};
