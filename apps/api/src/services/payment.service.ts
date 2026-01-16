
import { prisma } from "../lib/prisma";
import { razorpayService } from "./razorpay.service";
import { logger } from "../lib/logger";

export const paymentService = {
  async reconcilePayment(localPaymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: localPaymentId },
      include: { booking: true },
    });

    if (!payment) {
      logger.error(`Payment not found for reconciliation: ${localPaymentId}`);
      return;
    }

    if (!payment.providerPaymentId) {
      logger.warn(`Payment has no provider ID, cannot reconcile: ${localPaymentId}`);
      return;
    }

    // Don't modify if already final
    if (["CAPTURED", "REFUNDED", "FAILED"].includes(payment.status)) {
        return;
    }

    try {
      const remotePayment = await razorpayService.fetchPayment(payment.providerPaymentId);
      logger.info(`Fetched remote status for ${payment.id}: ${remotePayment.status}`);

      if (remotePayment.status === "captured") {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: "CAPTURED" },
          }),
          prisma.booking.update({
            where: { id: payment.bookingId },
            data: { paymentStatus: "PAID", status: "CONFIRMED" },
          }),
        ]);
        logger.info(`Reconciled payment ${payment.id} to CAPTURED`);
      } else if (remotePayment.status === "failed") {
        await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: { status: "FAILED" },
            }),
            prisma.booking.update({
              where: { id: payment.bookingId },
              data: { paymentStatus: "FAILED" }, // Don't cancel booking yet, allow retry?
            }),
          ]);
          logger.info(`Reconciled payment ${payment.id} to FAILED`);
      }
    } catch (error) {
      logger.error(`Reconciliation failed for ${payment.id}`, { error });
      throw error; // Throw so queue retries
    }
  },
};
