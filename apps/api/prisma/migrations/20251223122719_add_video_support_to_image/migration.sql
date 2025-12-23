/*
  Warnings:

  - Added the required column `startDate` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterEnum
ALTER TYPE "TripCategory" ADD VALUE 'CAMPING';

-- DropIndex
DROP INDEX "Booking_userId_tripId_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "guests" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalPrice" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "type" "MediaType" NOT NULL DEFAULT 'IMAGE';

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "altitude" TEXT,
ADD COLUMN     "cancellationPolicy" JSONB,
ADD COLUMN     "distance" TEXT,
ADD COLUMN     "endPoint" TEXT,
ADD COLUMN     "exclusions" JSONB,
ADD COLUMN     "faqs" JSONB,
ADD COLUMN     "highlights" JSONB,
ADD COLUMN     "inclusions" JSONB,
ADD COLUMN     "itineraryPdf" TEXT,
ADD COLUMN     "seasons" JSONB,
ADD COLUMN     "startPoint" TEXT,
ADD COLUMN     "thingsToPack" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "phoneNumber" TEXT;
