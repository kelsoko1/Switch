# ============================================
# Build Stage - Frontend & Backend
# ============================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl

# Copy package files for dependency installation
COPY package*.json ./
COPY server/package*.json ./server/

# Install all dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps
RUN cd server && npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build frontend with production environment
ENV NODE_ENV=production
RUN npm run build:frontend

# Build server (copy files to dist)
RUN cd server && npm run build

# ============================================
# Production Stage - Optimized Runtime
# ============================================
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    tini \
    dumb-init

# Set working directory
WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/temp

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy server files from builder (no dist folder, copy source directly)
COPY --from=builder /app/server/*.js ./server/
COPY --from=builder /app/server/config ./server/config
COPY --from=builder /app/server/routes ./server/routes
COPY --from=builder /app/server/middleware ./server/middleware
COPY --from=builder /app/server/utils ./server/utils
COPY --from=builder /app/server/services ./server/services
COPY --from=builder /app/server/package*.json ./server/

# Copy node_modules from builder (server dependencies already installed)
COPY --from=builder /app/server/node_modules ./server/node_modules

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV PORT=2025
ENV HOST=0.0.0.0

# Create a non-root user for security
RUN addgroup -g 1001 -S app && \
    adduser -S -u 1001 -G app app && \
    chown -R app:app /app

# Switch to non-root user
USER app

# Expose the application port
EXPOSE 2025

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:2025/health || exit 1

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Change to server directory so node can find dependencies
WORKDIR /app/server

# Start the application
CMD ["node", "index.js"]
