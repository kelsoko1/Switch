#!/bin/bash

# This script installs all necessary dependencies for the KijumbeSmart application

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing dependencies for KijumbeSmart application...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Update package lists
echo -e "${YELLOW}Updating package lists...${NC}"
apt-get update

# Install Node.js and npm if not already installed
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Installing Node.js and npm...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js version: $NODE_VERSION${NC}"

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
  echo -e "${YELLOW}Installing Nginx...${NC}"
  apt-get install -y nginx
fi

# Install Certbot for SSL certificates
echo -e "${YELLOW}Installing Certbot for SSL certificates...${NC}"
apt-get install -y certbot python3-certbot-nginx

# Install PM2 globally
echo -e "${YELLOW}Installing PM2 globally...${NC}"
npm install -g pm2

# Install other utilities
echo -e "${YELLOW}Installing other utilities...${NC}"
apt-get install -y curl wget git htop net-tools

# Set up firewall
echo -e "${YELLOW}Setting up firewall...${NC}"
apt-get install -y ufw
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 2025

# Enable firewall if not already enabled
if [ "$(ufw status | grep -c "Status: active")" -eq 0 ]; then
  echo -e "${YELLOW}Enabling firewall...${NC}"
  echo "y" | ufw enable
fi

# Install logrotate if not already installed
if ! command -v logrotate &> /dev/null; then
  echo -e "${YELLOW}Installing logrotate...${NC}"
  apt-get install -y logrotate
fi

# Create log directory if it doesn't exist
mkdir -p /var/log/kijumbesmart

# Set correct permissions
echo -e "${YELLOW}Setting correct permissions...${NC}"
chown -R root:root /root/switch
chmod +x /root/switch/*.sh

echo -e "${GREEN}All dependencies installed successfully!${NC}"
