/*
  Warnings:

  - You are about to drop the `_TripGalleryImages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TripGalleryImages" DROP CONSTRAINT "_TripGalleryImages_A_fkey";

-- DropForeignKey
ALTER TABLE "_TripGalleryImages" DROP CONSTRAINT "_TripGalleryImages_B_fkey";

-- DropTable
DROP TABLE "_TripGalleryImages";

-- CreateTable
CREATE TABLE "TripGalleryImage" (
    "tripId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TripGalleryImage_pkey" PRIMARY KEY ("tripId","imageId")
);

-- AddForeignKey
ALTER TABLE "TripGalleryImage" ADD CONSTRAINT "TripGalleryImage_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripGalleryImage" ADD CONSTRAINT "TripGalleryImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
