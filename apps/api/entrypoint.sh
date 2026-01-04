#!/bin/sh

# Wait for database to be ready (optional, depends_on healthcheck is better but this is a failsafe)
echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npm run prisma:seed

echo "Starting application..."
npm start
