/*
  Warnings:

  - The `status` column on the `TripInquiry` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,tripId,startDate]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TripInquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED');

-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_uploadedById_fkey";

-- AlterTable
ALTER TABLE "TripInquiry" DROP COLUMN "status",
ADD COLUMN     "status" "TripInquiryStatus" NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "Blog_coverImageId_idx" ON "Blog"("coverImageId");

-- CreateIndex
CREATE INDEX "Blog_tripId_idx" ON "Blog"("tripId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_userId_tripId_startDate_key" ON "Booking"("userId", "tripId", "startDate");

-- CreateIndex
CREATE INDEX "Image_uploadedById_idx" ON "Image"("uploadedById");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Trip_createdById_idx" ON "Trip"("createdById");

-- CreateIndex
CREATE INDEX "Trip_approvedById_idx" ON "Trip"("approvedById");

-- CreateIndex
CREATE INDEX "Trip_managerId_idx" ON "Trip"("managerId");

-- CreateIndex
CREATE INDEX "Trip_coverImageId_idx" ON "Trip"("coverImageId");

-- CreateIndex
CREATE INDEX "Trip_heroImageId_idx" ON "Trip"("heroImageId");

-- CreateIndex
CREATE INDEX "TripInquiry_status_idx" ON "TripInquiry"("status");

-- CreateIndex
CREATE INDEX "TripInquiry_createdAt_idx" ON "TripInquiry"("createdAt");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_avatarImageId_idx" ON "User"("avatarImageId");

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
