#!/bin/bash

# ============================================
# Quick Rebuild and Deploy Script
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Switch App - Rebuild and Deploy${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Stop existing containers
echo -e "${BLUE}Stopping existing containers...${NC}"
docker compose down
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

# Clean up old images (optional)
read -p "Remove old images to save space? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Removing old images...${NC}"
    docker compose down --rmi all
    echo -e "${GREEN}✓ Old images removed${NC}"
fi
echo ""

# Build new images
echo -e "${BLUE}Building new Docker images...${NC}"
docker compose build --no-cache
echo -e "${GREEN}✓ Images built successfully${NC}"
echo ""

# Start containers
echo -e "${BLUE}Starting containers...${NC}"
docker compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Wait for app to be ready
echo -e "${BLUE}Waiting for application to be ready...${NC}"
sleep 10

# Check health
MAX_ATTEMPTS=30
ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -f -s http://localhost:2025/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Application is healthy!${NC}"
        break
    fi
    echo -n "."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    echo -e "${RED}✗ Application failed health check${NC}"
    echo -e "${YELLOW}Check logs: docker compose logs -f${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Service Status:${NC}"
docker compose ps
echo ""
echo -e "${BLUE}Access your application:${NC}"
echo "  - Local:  http://localhost:2025"
echo "  - Domain: https://kijumbesmart.co.tz"
echo "  - Health: http://localhost:2025/health"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  - View logs:    docker compose logs -f"
echo "  - Restart:      docker compose restart"
echo "  - Stop:         docker compose stop"
echo ""
