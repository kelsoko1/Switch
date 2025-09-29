# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci
RUN cd server && npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Build server
RUN cd server && npm run build

# Production stage
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./dist/server
COPY --from=builder /app/server/package*.json ./dist/server/

# Copy environment files if they exist
COPY --from=builder /app/.env* ./

# Install production dependencies
RUN cd dist/server && npm ci --only=production

# Create necessary directories
RUN mkdir -p /app/logs

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max_old_space_size=4096
ENV PORT=2025
ENV HOST=0.0.0.0

# Expose the application port
EXPOSE 2025

# Create a non-root user
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:2025/api/health || exit 1

# Expose port
EXPOSE 2025

# Start the application
CMD ["node", "dist/server/index.js"]
