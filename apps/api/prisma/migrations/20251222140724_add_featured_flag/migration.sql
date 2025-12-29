-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Trip_isFeatured_idx" ON "Trip"("isFeatured");
