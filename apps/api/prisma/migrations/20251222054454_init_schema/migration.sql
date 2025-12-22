-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarImageId" TEXT,
ADD COLUMN     "bio" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarImageId_fkey" FOREIGN KEY ("avatarImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
