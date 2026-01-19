/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `TripInquiry` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('TRIP_CREATED', 'TRIP_UPDATED', 'TRIP_DELETED', 'TRIP_SUBMITTED', 'TRIP_APPROVED', 'TRIP_PUBLISHED', 'TRIP_ARCHIVED', 'TRIP_RESTORED', 'TRIP_COMPLETED', 'BLOG_CREATED', 'BLOG_UPDATED', 'BLOG_SUBMITTED', 'BLOG_APPROVED', 'BLOG_REJECTED', 'BLOG_PUBLISHED', 'BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'BOOKING_REJECTED', 'BOOKING_COMPLETED', 'USER_CREATED', 'USER_UPDATED', 'USER_ROLE_ASSIGNED', 'USER_ROLE_REVOKED', 'USER_STATUS_CHANGED', 'USER_STATUS_UPDATED', 'USER_SUSPENDED', 'USER_UNSUSPENDED', 'USER_BANNED', 'USER_DELETED', 'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED', 'ROLE_PERMISSION_ADDED', 'ROLE_PERMISSION_REMOVED', 'PAYMENT_CREATED', 'PAYMENT_CAPTURED', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED', 'PAYMENT_DISPUTED');

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL;

-- AlterTable
ALTER TABLE "NewsletterSubscriber" ALTER COLUMN "isActive" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "Trip_durationDays_idx" ON "Trip"("durationDays");

-- CreateIndex
CREATE INDEX "Trip_startPoint_idx" ON "Trip"("startPoint");

-- CreateIndex
CREATE UNIQUE INDEX "TripInquiry_phoneNumber_key" ON "TripInquiry"("phoneNumber");
