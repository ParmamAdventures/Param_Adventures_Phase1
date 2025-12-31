const { execSync } = require('child_process');
const path = require('path');

const DATABASE_URL = "postgresql://postgres1:emimHme3GNnsmP7kTixZGkMNqKkVeAb9@dpg-d5aco1ali9vc73b3u85g-a.oregon-postgres.render.com/param_adventures";

try {
  console.log('🚀 Starting Cloud Database Sync...');
  console.log('🔗 URL:', DATABASE_URL.substring(0, 15) + '...');
  
  // 1. Push schema
  console.log('📦 Pushing Prisma Schema...');
  execSync(`npx prisma db push --schema=prisma/schema.prisma --accept-data-loss`, {
    env: Object.assign({}, process.env, { DATABASE_URL }),
    stdio: 'inherit'
  });

  // 2. Generate client
  console.log('⚙️ Generating Prisma Client...');
  execSync(`npx prisma generate --schema=prisma/schema.prisma`, {
    env: { ...process.env, DATABASE_URL },
    stdio: 'inherit'
  });

  // 3. Seed data
  console.log('🌱 Seeding Professional Data...');
  execSync(`node prisma/seed.js`, {
    env: { ...process.env, DATABASE_URL },
    stdio: 'inherit'
  });

  console.log('✅ Cloud Database Is Ready!');
} catch (error) {
  console.error('❌ Migration Failed:', error.message);
  process.exit(1);
}
