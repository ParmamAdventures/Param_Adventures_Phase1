/*
  Warnings:

  - The `provider` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('RAZORPAY', 'STRIPE', 'PAYPAL', 'MANUAL', 'UNKNOWN');

-- DropIndex
DROP INDEX "Blog_slug_idx";

-- DropIndex
DROP INDEX "Review_userId_tripId_idx";

-- DropIndex
DROP INDEX "Trip_slug_idx";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "provider",
ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'RAZORPAY';
