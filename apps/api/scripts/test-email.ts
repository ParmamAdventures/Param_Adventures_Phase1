import dotenv from "dotenv";
import path from "path";

// Explicitly load .env from apps/api/.env
const envPath = path.join(process.cwd(), "apps", "api", ".env");
console.log("Loading env from:", envPath);
dotenv.config({ path: envPath });

async function main() {
  try {
    // Dynamic import ensures env is loaded BEFORE this file is read
    const { notificationService } = await import("../src/services/notification.service");

    console.log("🧪 Testing Email Service...");
    console.log("Sending test email to 'test@example.com'...");

    const info = await notificationService.sendEmail({
      to: "test@example.com",
      subject: "Test Email from Param Adventures",
      html: "<h1>It Works!</h1><p>If you see this, your email configuration (or Ethereal fallback) is working.</p>",
    });

    console.log("✅ Email sent successfully!");
    console.log(info);
  } catch (error) {
    console.error("❌ Email failed:", error);
  }
}

main();
