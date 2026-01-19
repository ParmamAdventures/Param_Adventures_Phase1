-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MODERATE', 'HARD', 'EXTREME');

-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "difficulty" TYPE "Difficulty" USING ("difficulty"::"Difficulty");
