const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking for recent submissions...");

  // 1. Check Inquiries
  try {
      const inquiry = await prisma.tripInquiry.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      console.log("\n--- Latest Inquiry ---");
      if (inquiry) {
        console.log(`Name: ${inquiry.name}`);
        console.log(`Dest: ${inquiry.destination}`);
        console.log(`Time: ${inquiry.createdAt}`);
      } else {
        console.log("No inquiries found yet.");
      }
  } catch (e) {
      console.log("Error checking inquiries: " + e.message);
  }

  // 2. Check Newsletter
  try {
      const sub = await prisma.newsletterSubscriber.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      console.log("\n--- Latest Subscriber ---");
      if (sub) {
        console.log(`Email: ${sub.email}`);
        console.log(`Active: ${sub.isActive}`);
      } else {
        console.log("No subscribers found yet.");
      }
  } catch (e) {
      console.log("Error checking subscribers: " + e.message);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
