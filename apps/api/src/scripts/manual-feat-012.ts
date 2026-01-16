
import { signAccessToken } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import request from "supertest";
import { app } from "../app";
import { razorpayService } from "../services/razorpay.service";

// Mock Razorpay Refund
razorpayService.refundPayment = async (paymentId: string, options) => {
    console.log(`[MOCK] Refunding ${options?.amount} for ${paymentId}`);
    return {
        id: "rfnd_mock_" + Date.now(),
        entity: "refund",
        amount: options?.amount, // Echo back
        currency: "INR",
        payment_id: paymentId,
        notes: options?.notes,
        created_at: Math.floor(Date.now() / 1000),
        status: "processed",
        speed: "normal"
    } as any;
};

async function run() {
    try {
        console.log("Starting Manual TEST (FEAT-012 Partial Refund)...");
        
        // 1. Setup Admin & Data
        const admin = await prisma.user.upsert({
            where: { email: 'admin-refund@test.com' },
            create: { email: 'admin-refund@test.com', password: 'pw', name: 'Admin', roles: { create: { role: { create: { name: 'admin' } } } } },
            update: {}
        });
        // Ensure admin has permission (assuming we bypassed RBAC for simplicity or using existing admin)
        // Actually the endpoint checks `requireRole("admin")`.
        // Let's use existing role mechanism or just assuming the upsert works (might fail on role name unique).
        // Let's assume there's an admin role.
        
        // Simplified setup:
        const token = signAccessToken(admin.id);

        const trip = await prisma.trip.create({
            data: { title: "Refund Trip", slug: `ref-trip-${Date.now()}`, price: 1000, createdById: admin.id, status: "PUBLISHED", description: "Test", itinerary: {}, difficulty: "EASY", location: "Loc", durationDays: 1 }
        });
        const booking = await prisma.booking.create({ data: { userId: admin.id, tripId: trip.id, totalPrice: 1000, status: "CONFIRMED", startDate: new Date(), paymentStatus: "PAID" } });
        
        // Create Captured Payment (1000.00 INR = 100000 paise)
        const payment = await prisma.payment.create({
            data: { bookingId: booking.id, provider: "razorpay", providerOrderId: "ord_ref_" + Date.now(), providerPaymentId: "pay_ref_" + Date.now(), amount: 100000, status: "CAPTURED" }
        });

        // 2. Perform Partial Refund (500.00 INR = 50000 paise)
        console.log("Testing Partial Refund (50%)...");
        const res = await request(app).post(`/bookings/${booking.id}/refund`)
            .set("Authorization", `Bearer ${token}`)
            .send({ amount: 50000, cancelBooking: false });

        if (res.status === 200) {
            console.log("✅ Partial Refund request success.");
            
            const updatedPayment = await prisma.payment.findUnique({ where: { id: payment.id } });
            const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });

            console.log(`Payment Status: ${updatedPayment?.status} (Expected: PARTIALLY_REFUNDED)`);
            console.log(`Refunded Amount: ${updatedPayment?.refundedAmount} (Expected: 50000)`);
            console.log(`Booking Status: ${updatedBooking?.status} (Expected: CONFIRMED)`);

            if (updatedPayment?.status === "PARTIALLY_REFUNDED" && updatedPayment.refundedAmount === 50000 && updatedBooking?.status === "CONFIRMED") {
                console.log("✅ Full Logic Verification Passed");
            } else {
                console.error("❌ Logic Verification Failed");
            }
        } else {
            console.error("❌ Refund request failed", res.body);
        }

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
