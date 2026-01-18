/**
 * Reset admin password script
 * Run with: npx ts-node reset-admin-password.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const email = 'admin@paramadventures.com';
    const newPassword = 'Admin@123';
    
    console.log('\n🔐 Resetting admin password...');
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}\n`);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    
    console.log('✅ Password reset successful!');
    console.log(`User: ${user.name} (${user.email})`);
    console.log('\nYou can now login with:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${newPassword}\n`);
    
  } catch (error: any) {
    console.error('❌ Password reset failed:', error.message);
    
    if (error.code === 'P2025') {
      console.log('\n💡 User not found. Creating admin user...');
      await createAdminUser();
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function createAdminUser() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'admin@paramadventures.com',
      password: hashedPassword,
      name: 'Admin User',
      status: 'ACTIVE',
    },
  });
  
  console.log('✅ Admin user created!');
  console.log(`Email: admin@paramadventures.com`);
  console.log(`Password: Admin@123`);
}

resetAdminPassword();
