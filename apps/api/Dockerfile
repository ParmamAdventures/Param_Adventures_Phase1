# Stage 1: Build
FROM node:20-alpine AS builder

# Add build dependencies for Prisma (Alpine requires compat libs)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy root package files for lockfile consistency
COPY package*.json ./

# Copy api package file
COPY apps/api/package.json ./apps/api/

# Copy prisma schema early for generation
COPY apps/api/prisma ./apps/api/prisma/

# Install dependencies (from root to respect workspace)
# Note: Using npm install because lockfile might be out of sync in dev env,
# but in CI 'npm ci' is better. Stick to install for robustness here.
RUN npm install

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# Copy source code
WORKDIR /app
COPY apps/api ./apps/api/
COPY tsconfig.json ./
COPY apps/api/tsconfig.json ./apps/api/

# Build the application
WORKDIR /app/apps/api
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

# Add production runtime dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy built artifacts and dependencies
# In a perfect world we'd prune dev deps, but with workspaces it's tricky without turbo prune.
# For simplicity/reliability in this phase, we copy node_modules.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/

WORKDIR /app/apps/api

# Expose the API port
EXPOSE 3000

# Environment defaults
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/server.js"]
