import nodemailer from "nodemailer";
import { env } from "../config/env";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class NotificationService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter() {
    if (this.transporter) return this.transporter;

    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      // Use configured SMTP
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT || "587"),
        secure: env.SMTP_PORT === "465",
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to Ethereal Mail (Real emails, but trapped in a dev mailbox)
      console.log("⚠️ No SMTP config found. Generating Ethereal testing account...");
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    return this.transporter;
  }

  async sendEmail(options: EmailOptions) {
    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: env.SMTP_FROM,
        ...options,
      });

      console.log(`✉️ Notification sent: ${info.messageId}`);
      if (!env.SMTP_HOST) {
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return info;
    } catch (error) {
      console.error("❌ Failed to send email notification:", error);
      throw error;
    }
  }

  // Pre-defined templates
  async sendBookingConfirmation(email: string, bookingDetails: any) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #f97316;">Adventure Awaits! 🏔️</h2>
        <p>Hi <strong>${bookingDetails.userName}</strong>,</p>
        <p>Your booking for <strong>${bookingDetails.tripTitle}</strong> has been received and is currently <strong>${bookingDetails.status}</strong>.</p>
        <div style="background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Order ID:</strong> #${bookingDetails.bookingId.substring(0, 8)}</p>
          <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${new Date(bookingDetails.startDate).toLocaleDateString()}</p>
        </div>
        <p>Once your payment is verified, we'll send you a confirmation with more details.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Param Adventures — Premium Travel Experiences</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `Booking Received: ${bookingDetails.tripTitle}`,
      html,
    });
  }

  async sendPaymentSuccess(email: string, paymentDetails: any) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #22c55e;">Payment Confirmed! ✅</h2>
        <p>Hi <strong>${paymentDetails.userName}</strong>,</p>
        <p>We've successfully processed your payment for <strong>${paymentDetails.tripTitle}</strong>.</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Booking Status:</strong> CONFIRMED</p>
          <p style="margin: 5px 0 0 0;"><strong>Amount Paid:</strong> ₹${paymentDetails.amount}</p>
        </div>
        <p>Get ready for an unforgettable journey! You can view your booking details in your dashboard.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Param Adventures — Premium Travel Experiences</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `Payment Confirmed: ${paymentDetails.tripTitle}`,
      html,
    });
  }

  async sendAssignmentNotification(email: string, assignmentDetails: any) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #6366f1;">New Assignment! 📋</h2>
        <p>Hi <strong>${assignmentDetails.userName}</strong>,</p>
        <p>You have been assigned as a <strong>${assignmentDetails.role}</strong> for the upcoming trip: <strong>${assignmentDetails.tripTitle}</strong>.</p>
        <div style="background: #eef2ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Trip:</strong> ${assignmentDetails.tripTitle}</p>
          <p style="margin: 5px 0 0 0;"><strong>Role:</strong> ${assignmentDetails.role}</p>
        </div>
        <p>Please log in to your dashboard to view the trip logistics and guest list.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Param Adventures — Premium Travel Experiences</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `New Assignment: ${assignmentDetails.tripTitle}`,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, resetLink: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #ef4444;">Reset Your Password 🔒</h2>
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        <p>Click the button below to reset your password:</p>
        <div style="margin: 20px 0;">
          <a href="${resetLink}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #666;">This link expires in 15 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Param Adventures — Premium Travel Experiences</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject: "Reset Your Password", html });
  }

  async sendRefundEmail(email: string, refundDetails: any) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #6366f1;">Refund Processed 💸</h2>
        <p>Hi <strong>${refundDetails.userName}</strong>,</p>
        <p>A refund has been processed for your booking <strong>${refundDetails.tripTitle}</strong>.</p>
        <div style="background: #eef2ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Amount Refunded:</strong> ₹${refundDetails.amount / 100}</p>
          <p style="margin: 5px 0 0 0;"><strong>Booking Status:</strong> CANCELLED</p>
          <p style="margin: 5px 0 0 0;"><strong>Reference ID:</strong> ${refundDetails.refundId}</p>
        </div>
        <p>The amount should reflect in your account within 5-7 business days.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Param Adventures — Premium Travel Experiences</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: "Refund Processed: " + refundDetails.tripTitle,
      html,
    });
  }

  async sendPaymentInitiated(email: string, details: any) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #3b82f6;">Payment Initiated 💳</h2>
        <p>Hi <strong>${details.userName}</strong>,</p>
        <p>You have initiated a payment of <strong>₹${details.amount / 100}</strong> for <strong>${details.tripTitle}</strong>.</p>
        <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Order ID:</strong> ${details.orderId}</p>
          <p style="margin: 5px 0 0 0;"><strong>Status:</strong> PENDING</p>
        </div>
        <p>If you haven't completed the payment yet, please do so via your dashboard.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Param Adventures — Premium Travel Experiences</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject: "Payment Initiated: " + details.tripTitle, html });
  }

  async sendPaymentFailed(email: string, details: any) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #ef4444;">Payment Failed ❌</h2>
        <p>Hi <strong>${details.userName}</strong>,</p>
        <p>We encountered an issue processing your payment for <strong>${details.tripTitle}</strong>.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Amount:</strong> ₹${details.amount / 100}</p>
           <p style="margin: 5px 0 0 0;"><strong>Reason:</strong> ${details.reason || "Transaction declined"}</p>
        </div>
        <p>Please try again or contact support if the issue persists.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Param Adventures — Premium Travel Experiences</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject: "Action Required: Payment Failed", html });
  }

  async sendReviewInvitation(email: string, details: { tripTitle: string; reviewLink: string }) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #f97316;">How was your trip? 🎒</h2>
        <p>Hi there,</p>
        <p>We hope you had an incredible time on your recent trip: <strong>${details.tripTitle}</strong>!</p>
        <p>Your feedback helps us curate the best adventures and helps other travelers plan their journeys. Could you take a minute to share your experience?</p>
        <div style="margin: 20px 0;">
          <a href="${details.reviewLink}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Leave a Review</a>
        </div>
        <p>Thank you for traveling with Param Adventures.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Param Adventures — Premium Travel Experiences</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `Share your experience: ${details.tripTitle}`,
      html,
    });
  }
}

export const notificationService = new NotificationService();
