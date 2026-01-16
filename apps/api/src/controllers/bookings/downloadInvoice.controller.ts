
import { Request, Response } from "express";
import { invoiceService } from "../../services/invoice.service";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { ApiResponse } from "../../utils/ApiResponse";

export const downloadInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  // Verify ownership
  const booking = await prisma.booking.findUnique({
      where: { id },
      select: { userId: true }
  });

  if (!booking) {
      throw new HttpError(404, "NOT_FOUND", "Booking not found");
  }

  const isOwner = booking.userId === userId;
  // Use optional chaining for permissions since it might be string[] or Set or undefined dependent on middleware version
//   const isAdmin = req.permissions?.includes?.("bookings:read"); 
//   const permissions = req.permissions as unknown as Set<string>;
//   const isAdmin = permissions?.has?.("bookings:read");
    
    // Simplest Check: allow if owner or if user has admin role
    const userRoles = req.user?.roles || [];
    const isAdmin = userRoles.includes("super_admin") || userRoles.includes("admin");

  if (!isOwner && !isAdmin) {
      throw new HttpError(403, "FORBIDDEN", "Unauthorized");
  }

  const pdfBuffer = await invoiceService.generateInvoice(id);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
    "Content-Length": pdfBuffer.length,
  });

  res.send(pdfBuffer);
};
