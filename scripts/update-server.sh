#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="switch"
APP_USER="$APP_NAME"
APP_DIR="/opt/$APP_NAME"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root${NC}"
  exit 1
fi

echo -e "${YELLOW}🚀 Starting server update for $APP_NAME...${NC}"

# Update system packages
echo -e "${YELLOW}🔄 Updating system packages...${NC}"
apt-get update
apt-get upgrade -y
apt-get autoremove -y
apt-get autoclean

# Update Node.js if needed
CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$CURRENT_NODE_VERSION" -lt 18 ]; then
  echo -e "${YELLOW}⬆️  Updating Node.js to version 18...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Update PM2
echo -e "${YELLOW}🔄 Updating PM2...${NC}"
npm install -g pm2@latest

# Update application dependencies
if [ -d "$APP_DIR" ]; then
  echo -e "${YELLOW}🔄 Updating application dependencies...${NC}"
  cd "$APP_DIR"
  su - "$APP_USER" -c "cd '$APP_DIR' && npm install"
  
  if [ -d "$APP_DIR/server" ]; then
    echo -e "${YELLOW}🔄 Updating server dependencies...${NC}"
    su - "$APP_USER" -c "cd '$APP_DIR/server' && npm install"
  fi
  
  # Restart the application
  echo -e "${YELLOW}🔄 Restarting application...${NC}"
  systemctl restart "$APP_NAME"
  systemctl restart nginx
else
  echo -e "${YELLOW}ℹ️  Application directory not found at $APP_DIR${NC}"
fi

# Update SSL certificates if they exist
if [ -d "/etc/letsencrypt/live" ]; then
  echo -e "${YELLOW}🔄 Renewing SSL certificates...${NC}"
  certbot renew --quiet --deploy-hook "systemctl reload nginx"
fi

echo -e "${GREEN}✅ Server update completed successfully!${NC}"
