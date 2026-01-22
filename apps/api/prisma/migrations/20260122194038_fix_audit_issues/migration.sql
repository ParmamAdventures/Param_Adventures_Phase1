/*
  Warnings:

  - A unique constraint covering the columns `[originalUrl]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "NewsletterSubscriber_email_idx";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Image_originalUrl_key" ON "Image"("originalUrl");

-- CreateIndex
CREATE INDEX "Image_createdAt_idx" ON "Image"("createdAt");

-- CreateIndex
CREATE INDEX "Image_type_idx" ON "Image"("type");

-- CreateIndex
CREATE INDEX "TripInquiry_email_idx" ON "TripInquiry"("email");
