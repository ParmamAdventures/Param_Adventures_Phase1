# Stage 1: Build
FROM node:18-alpine AS builder

# Add build dependencies for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production Runner
FROM node:18-alpine AS runner

# Add production runtime dependencies for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy Prisma client, schema, and built artifacts from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Expose the API port
EXPOSE 3000

# Environment defaults
ENV NODE_ENV=production
ENV PORT=3000

# Start the application via entrypoint script
CMD ["./entrypoint.sh"]
