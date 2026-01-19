-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "guestDetails" SET DEFAULT '[]';

-- CreateIndex
CREATE INDEX "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_userId_createdAt_idx" ON "Booking"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_tripId_status_createdAt_idx" ON "Booking"("tripId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_isActive_createdAt_idx" ON "NewsletterSubscriber"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "Review_userId_tripId_idx" ON "Review"("userId", "tripId");

-- CreateIndex
CREATE INDEX "Review_tripId_rating_idx" ON "Review"("tripId", "rating");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE INDEX "Trip_status_isFeatured_createdAt_idx" ON "Trip"("status", "isFeatured", "createdAt");

-- CreateIndex
CREATE INDEX "Trip_category_status_idx" ON "Trip"("category", "status");

-- CreateIndex
CREATE INDEX "Trip_difficulty_price_idx" ON "Trip"("difficulty", "price");

-- CreateIndex
CREATE INDEX "TripGalleryImage_tripId_idx" ON "TripGalleryImage"("tripId");

-- CreateIndex
CREATE INDEX "TripGalleryImage_imageId_order_idx" ON "TripGalleryImage"("imageId", "order");

-- CreateIndex
CREATE INDEX "TripInquiry_email_status_idx" ON "TripInquiry"("email", "status");

-- CreateIndex
CREATE INDEX "TripInquiry_status_createdAt_idx" ON "TripInquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TripsOnGuides_tripId_idx" ON "TripsOnGuides"("tripId");

-- CreateIndex
CREATE INDEX "TripsOnGuides_guideId_idx" ON "TripsOnGuides"("guideId");

-- CreateIndex
CREATE INDEX "TripsOnGuides_assignedAt_idx" ON "TripsOnGuides"("assignedAt");
