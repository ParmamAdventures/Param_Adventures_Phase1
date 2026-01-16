import { PrismaClient  } from "@prisma/client";

(async () => {
  const p = new PrismaClient();
  try {
    const u = await p.user.findUnique({ where: { email: "admin@local.test" } });
    console.log("user", u ? u.id : u);
    if (!u) return;
    const bs = await p.booking.findMany({
      where: { userId: u.id },
      include: { trip: true },
    });
    console.log("bookings", JSON.stringify(bs, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
})();
