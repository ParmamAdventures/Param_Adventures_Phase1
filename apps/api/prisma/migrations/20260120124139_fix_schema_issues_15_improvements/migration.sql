/*
  Warnings:

  - You are about to drop the column `isActive` on the `NewsletterSubscriber` table. All the data in the column will be lost.
  - Made the column `method` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "NewsletterSubscriber_isActive_createdAt_idx";

-- DropIndex
DROP INDEX "TripInquiry_phoneNumber_key";

-- AlterTable
ALTER TABLE "NewsletterSubscriber" DROP COLUMN "isActive",
ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "method" SET NOT NULL,
ALTER COLUMN "method" SET DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "Blog_slug_idx" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_status_createdAt_idx" ON "Blog"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Blog_deletedAt_idx" ON "Blog"("deletedAt");

-- CreateIndex
CREATE INDEX "Booking_tripId_startDate_idx" ON "Booking"("tripId", "startDate");

-- CreateIndex
CREATE INDEX "Booking_userId_paymentStatus_idx" ON "Booking"("userId", "paymentStatus");

-- CreateIndex
CREATE INDEX "Booking_status_paymentStatus_idx" ON "Booking"("status", "paymentStatus");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_isSubscribed_createdAt_idx" ON "NewsletterSubscriber"("isSubscribed", "createdAt");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_email_idx" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "SavedTrip_tripId_idx" ON "SavedTrip"("tripId");

-- CreateIndex
CREATE INDEX "Trip_deletedAt_idx" ON "Trip"("deletedAt");

-- CreateIndex
CREATE INDEX "Trip_status_deletedAt_idx" ON "Trip"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "TripInquiry_phoneNumber_idx" ON "TripInquiry"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_email_deletedAt_idx" ON "User"("email", "deletedAt");
