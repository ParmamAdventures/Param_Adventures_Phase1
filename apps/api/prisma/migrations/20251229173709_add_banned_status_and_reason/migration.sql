-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'BANNED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "statusReason" TEXT;
