/*
  Warnings:

  - The values [ARCHIVED] on the enum `BlogStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_BlogContentImages` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `content` on the `Blog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BlogStatus_new" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');
ALTER TABLE "Blog" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Blog" ALTER COLUMN "status" TYPE "BlogStatus_new" USING ("status"::text::"BlogStatus_new");
ALTER TYPE "BlogStatus" RENAME TO "BlogStatus_old";
ALTER TYPE "BlogStatus_new" RENAME TO "BlogStatus";
DROP TYPE "BlogStatus_old";
ALTER TABLE "Blog" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "_BlogContentImages" DROP CONSTRAINT "_BlogContentImages_A_fkey";

-- DropForeignKey
ALTER TABLE "_BlogContentImages" DROP CONSTRAINT "_BlogContentImages_B_fkey";

-- DropIndex
DROP INDEX "Blog_slug_idx";

-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "tripId" TEXT,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- DropTable
DROP TABLE "_BlogContentImages";

-- CreateIndex
CREATE INDEX "Blog_authorId_idx" ON "Blog"("authorId");

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
