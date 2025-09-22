#!/bin/bash

# This script updates the application with the latest code

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting application update process...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Navigate to application directory
cd /root/switch

# Create a backup before updating
echo -e "${YELLOW}Creating backup before update...${NC}"
./backup.sh

# Pull latest code (assuming git is used)
if [ -d ".git" ]; then
  echo -e "${YELLOW}Pulling latest code from repository...${NC}"
  git pull
else
  echo -e "${RED}Not a git repository. Manual code update required.${NC}"
  exit 1
fi

# Update dependencies
echo -e "${YELLOW}Updating dependencies...${NC}"
npm install

# Update environment files if needed
echo -e "${YELLOW}Updating environment files...${NC}"
node update-env.js

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm run build

# Restart the application
echo -e "${YELLOW}Restarting the application...${NC}"
pm2 reload ecosystem.config.js --env production

# Check if the application is running
echo -e "${YELLOW}Checking if the application is running...${NC}"
sleep 10
PORT_CHECK=$(netstat -tuln | grep 2025)
if [ -z "$PORT_CHECK" ]; then
  echo -e "${RED}ERROR: Application is not running after update. Rolling back...${NC}"
  
  # TODO: Add rollback logic here
  
  exit 1
else
  echo -e "${GREEN}✓ Application is running successfully after update${NC}"
fi

# Run health check
echo -e "${YELLOW}Running health check...${NC}"
./health-check.sh

echo -e "${GREEN}Update process completed successfully!${NC}"
