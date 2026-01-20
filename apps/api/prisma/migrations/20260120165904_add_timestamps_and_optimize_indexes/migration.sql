/*
  Warnings:

  - Added the required column `updatedAt` to the `SavedTrip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TripsOnGuides` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SavedTrip" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TripsOnGuides" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
