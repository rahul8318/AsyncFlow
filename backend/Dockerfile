# Multi-Stage Production Dockerfile for AsyncFlow Backend

# Stage 1: Build & Prune
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for build tools
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for build
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Compile TypeScript
RUN npm run build

# Prune devDependencies for production
RUN npm prune --production

# Stage 2: Minimal Production Image
FROM node:22-alpine AS runner

WORKDIR /app

# Add security user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 asyncflow

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl libc6-compat

# Copy node_modules and built files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Create upload directory and grant permissions
RUN mkdir -p uploads && chown -R asyncflow:nodejs /app

USER asyncflow

EXPOSE 5000

ENV PORT=5000 \
    NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
