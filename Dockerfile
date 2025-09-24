# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build frontend and server
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/ecosystem.config.js ./server/

# Install PM2 globally
RUN npm install -g pm2

# Install production dependencies
RUN cd server && npm install --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=2025

# Expose port
EXPOSE 2025

# Start the application using PM2
CMD ["pm2-runtime", "server/ecosystem.config.js"]
