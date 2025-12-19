-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentStatus" "BookingPaymentStatus" NOT NULL DEFAULT 'PENDING';
