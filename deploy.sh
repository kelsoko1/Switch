#!/bin/bash

# Exit on any error
set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Deployment Configuration
PROJECT_NAME="Kijumbe"
FRONTEND_DIR="frontend"
BACKEND_DIR="."
NODE_VERSION="18.x"

# Predeployment Checks
echo -e "${YELLOW}🚀 Starting ${PROJECT_NAME} Deployment${NC}"

# Check Node.js and npm versions
echo -e "${YELLOW}Checking Node.js and npm versions...${NC}"
NODE_CURRENT=$(node --version)
NPM_CURRENT=$(npm --version)

# Validate Node.js version
if [[ ! $NODE_CURRENT =~ ^v18\. ]]; then
    echo -e "${YELLOW}Warning: Recommended Node.js version is 18.x. Current version: $NODE_CURRENT${NC}"
fi

# Install global dependencies
echo -e "${YELLOW}Installing global dependencies...${NC}"
npm install -g pm2 npm@latest

# Install project dependencies
echo -e "${YELLOW}Installing project dependencies...${NC}"
npm run install-all

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build

# Run database migrations (if applicable)
# Uncomment and customize as needed
# echo -e "${YELLOW}Running database migrations...${NC}"
# npm run migrate

# Start application with PM2
echo -e "${YELLOW}Starting application with PM2...${NC}"
pm2 delete $PROJECT_NAME || true
pm2 start server.js --name "$PROJECT_NAME" \
    --env production \
    -i max

# Save PM2 process list
pm2 save

# Display deployment status
echo -e "${GREEN}✅ Deployment Successful!${NC}"
echo -e "${GREEN}Application is running. Check status with 'pm2 status'${NC}"

# Optional: Health check
# Uncomment and customize URL as needed
# HEALTH_CHECK_URL="http://localhost:3000/health"
# HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL)
# if [ $HEALTH_STATUS -eq 200 ]; then
#     echo -e "${GREEN}✅ Health check passed${NC}"
# else
#     echo -e "${YELLOW}⚠️ Health check failed with status $HEALTH_STATUS${NC}"
# fi
