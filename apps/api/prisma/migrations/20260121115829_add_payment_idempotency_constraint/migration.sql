/*
  Warnings:

  - A unique constraint covering the columns `[bookingId,providerPaymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_providerPaymentId_key" ON "Payment"("bookingId", "providerPaymentId");
