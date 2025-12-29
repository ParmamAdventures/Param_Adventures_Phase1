-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TripStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "TripStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "managerId" TEXT;

-- CreateTable
CREATE TABLE "TripsOnGuides" (
    "tripId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripsOnGuides_pkey" PRIMARY KEY ("tripId","guideId")
);

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripsOnGuides" ADD CONSTRAINT "TripsOnGuides_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripsOnGuides" ADD CONSTRAINT "TripsOnGuides_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
