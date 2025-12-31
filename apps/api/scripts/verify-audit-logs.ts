import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  console.log("Found Logs:", logs.length);
  const listLog = logs.find((l) => l.action === "USER_LIST_VIEW");

  if (listLog) {
    console.log("SUCCESS: Found USER_LIST_VIEW log:", JSON.stringify(listLog));
  } else {
    console.log("FAILURE: USER_LIST_VIEW log not found.");
    console.log(
      "Recent actions:",
      logs.map((l) => l.action),
    );
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
