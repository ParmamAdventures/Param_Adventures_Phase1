const fs = require("fs");
const path = require("path");

const files = [
  "src/controllers/wishlist.controller.ts",
  "src/controllers/trips/getTripBySlug.controller.ts",
  "src/controllers/payments/refundBooking.controller.ts",
  "src/controllers/payments/initiatePayment.controller.ts",
  "src/controllers/payments/getPaymentStatus.controller.ts",
  "src/controllers/payments/createManualPayment.controller.ts",
  "src/controllers/payments/createPaymentIntent.controller.ts",
  "src/controllers/blogs/getBlogById.controller.ts",
  "src/controllers/blogs/updateBlog.controller.ts",
  "src/controllers/blogs/rejectBlog.controller.ts",
  "src/controllers/blogs/publishBlog.controller.ts",
  "src/controllers/blogs/submitBlog.controller.ts",
  "src/controllers/blogs/getBlogBySlug.controller.ts",
  "src/controllers/blogs/approveBlog.controller.ts",
  "src/controllers/bookings/downloadInvoice.controller.ts",
  "src/controllers/bookings/approveBooking.controller.ts",
  "src/controllers/bookings/rejectBooking.controller.ts",
  "src/controllers/media/setTripGallery.controller.ts",
  "src/controllers/admin/trip-assignment.controller.ts",
  "src/controllers/admin/listTripBookings.controller.ts",
  "src/controllers/admin/getTripBookings.controller.ts",
];

const replacements = [
  { find: '"Trip not found"', replace: "ErrorMessages.TRIP_NOT_FOUND" },
  { find: '"Blog not found"', replace: "ErrorMessages.BLOG_NOT_FOUND" },
  { find: '"Booking not found"', replace: "ErrorMessages.BOOKING_NOT_FOUND" },
];

let totalChanges = 0;
const changedFiles = [];

files.forEach((file) => {
  if (!fs.existsSync(file)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(file, "utf8");
  const originalContent = content;
  let fileChanged = false;

  // Apply replacements
  replacements.forEach(({ find, replace }) => {
    if (content.includes(find)) {
      const count = (
        content.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []
      ).length;
      content = content.replace(
        new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        replace,
      );
      totalChanges += count;
      fileChanged = true;
    }
  });

  // Add import if needed
  if (fileChanged && !content.includes("ErrorMessages")) {
    // Find first import statement
    const importMatch = content.match(/^import .+;$/m);
    if (importMatch) {
      const insertPos = content.indexOf(importMatch[0]) + importMatch[0].length;
      content =
        content.slice(0, insertPos) +
        '\nimport { ErrorMessages } from "../../constants/errorMessages";' +
        content.slice(insertPos);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, "utf8");
    changedFiles.push(file);
    console.log(`✅ Updated: ${file}`);
  }
});

console.log(
  `\n🎉 Done! Replaced ${totalChanges} hardcoded error strings in ${changedFiles.length} files\n`,
);
changedFiles.forEach((f) => console.log(`  - ${f}`));
