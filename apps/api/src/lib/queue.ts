import { Queue, Worker, Job } from "bullmq";
import { redisConnection } from "./redis";
import { prisma } from "./prisma";
import { notificationService } from "../services/notification.service";
import { paymentService } from "../services/payment.service";
import { emitToUser } from "./socket";

// Define Job Data Types
export type JobType = "SEND_BOOKING_EMAIL" | "SEND_PAYMENT_EMAIL" | "SEND_ASSIGNMENT_EMAIL" | "SEND_REFUND_EMAIL" | "RECONCILE_PAYMENT";

interface JobData {
  type: JobType;
  payload: any;
}

const QUEUE_NAME = "param_adventures_notifications";

// 1. Create the Queue
export const notificationQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // Wait 5s, then 10s, then 20s
    },
    removeOnComplete: true,
  },
});

// 2. Create the Worker
export const notificationWorker = new Worker(
  QUEUE_NAME,
  async (job: Job<any>) => { // Relaxed type to allow flexible data
    const type = job.name as JobType; 
    const payload = job.data;
    console.log(`👷 Processing job ${job.id} of type ${type}...`);

    try {
      // Common: Fetch user details if userId is provided
      let user = null;
      if (payload.userId) {
        user = await prisma.user.findUnique({ where: { id: payload.userId } });
      }

      if (!user && payload.userId) {
        console.warn(`⚠️ User not found for job ${job.id}`);
        return;
      }

      switch (type) {
        case "SEND_BOOKING_EMAIL":
          await notificationService.sendBookingConfirmation(user!.email, {
            ...payload.details,
            userName: user!.name || user!.email,
          });
          emitToUser(payload.userId, "booking_update", {
            message: "Booking request received",
            details: payload.details,
          });
          break;
        case "SEND_PAYMENT_EMAIL":
          await notificationService.sendPaymentSuccess(user!.email, {
            ...payload.details,
            userName: user!.name || user!.email,
          });
          emitToUser(payload.userId, "payment_update", {
            status: "SUCCESS",
            message: "Payment verified successfully!",
          });
          break;
        case "SEND_ASSIGNMENT_EMAIL":
          await notificationService.sendAssignmentNotification(user!.email, {
            ...payload.details,
            role: payload.role,
            userName: user!.name || user!.email,
          });
          emitToUser(payload.userId, "assignment_update", {
            role: payload.role,
            tripTitle: payload.details.tripTitle,
          });
          break;
        case "SEND_REFUND_EMAIL":
          await notificationService.sendRefundEmail(user!.email, {
             ...payload.details,
             userName: user!.name || user!.email,
          });
          emitToUser(payload.userId, "refund_update", {
            status: "REFUNDED",
            message: "Refund processed successfully",
            amount: payload.details.amount
          });
          break;
        case "RECONCILE_PAYMENT":
          // Payload: { paymentId: string }
          await paymentService.reconcilePayment(payload.paymentId);
          break;
        default:
          console.warn(`❓ Unknown job type: ${type}`);
      }
    } catch (error) {
      console.error(`❌ Error processing job ${job.id}:`, error);
      throw error; // Rethrow to trigger BullMQ retry
    }
  },
  { connection: redisConnection },
);

notificationWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

notificationWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
