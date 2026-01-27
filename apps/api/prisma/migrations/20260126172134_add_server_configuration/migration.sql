-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'SETTING_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'CONFIG_CHANGED';

-- DropIndex
DROP INDEX "Review_tripId_idx";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "method" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ServerConfiguration" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "dataType" TEXT NOT NULL DEFAULT 'string',
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "isEnvironmentVar" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServerConfiguration_category_idx" ON "ServerConfiguration"("category");

-- CreateIndex
CREATE INDEX "ServerConfiguration_updatedBy_idx" ON "ServerConfiguration"("updatedBy");

-- CreateIndex
CREATE INDEX "ServerConfiguration_createdAt_idx" ON "ServerConfiguration"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServerConfiguration_category_key_key" ON "ServerConfiguration"("category", "key");

-- CreateIndex
CREATE INDEX "User_phoneNumber_idx" ON "User"("phoneNumber");

-- AddForeignKey
ALTER TABLE "ServerConfiguration" ADD CONSTRAINT "ServerConfiguration_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
