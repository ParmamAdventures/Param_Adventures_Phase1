-- CreateEnum
CREATE TYPE "TripCategory" AS ENUM ('TREK', 'CORPORATE', 'EDUCATIONAL', 'SPIRITUAL', 'CUSTOM');

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "category" "TripCategory" NOT NULL DEFAULT 'TREK';

-- CreateIndex
CREATE INDEX "Trip_category_idx" ON "Trip"("category");
