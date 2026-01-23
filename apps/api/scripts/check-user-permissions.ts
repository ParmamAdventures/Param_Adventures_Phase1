#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function show(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      },
    },
  });
  if (!user) {
    console.log(`❌ No user found: ${email}`);
    return;
  }
  const roles = user.roles.map((ur) => ur.role.name);
  const perms = new Set<string>();
  user.roles.forEach((ur) => ur.role.permissions.forEach((rp) => perms.add(rp.permission.key)));
  console.log(`\n👤 ${email}`);
  console.log(`Roles: ${roles.join(", ")}`);
  console.log(`Permissions (${perms.size}):`);
  const sorted = Array.from(perms).sort();
  for (const k of sorted) console.log(`  • ${k}`);
}

async function main() {
  await show("admin@paramadventures.com");
  await show("user@paramadventures.com");
}

main().finally(() => prisma.$disconnect());
