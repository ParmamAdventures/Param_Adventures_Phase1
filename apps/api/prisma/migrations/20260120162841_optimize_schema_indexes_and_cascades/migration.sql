-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_createdById_fkey";

-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "createdById" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Booking_userId_status_idx" ON "Booking"("userId", "status");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
