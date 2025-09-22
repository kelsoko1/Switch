#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment of KijumbeSmart application...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Install required dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx nodejs npm

# Install PM2 globally
echo -e "${YELLOW}Installing PM2...${NC}"
npm install -g pm2

# Create environment files
echo -e "${YELLOW}Creating environment files...${NC}"
node update-env.js

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm install
npm run build

# Set up PM2 to start on boot
echo -e "${YELLOW}Setting up PM2 to start on boot...${NC}"
pm2 startup systemd
pm2 start ecosystem.config.js --env production
pm2 save

# Copy systemd service file
echo -e "${YELLOW}Setting up systemd service...${NC}"
cp kijumbesmart.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable kijumbesmart.service

# Set up Nginx (HTTP only first)
echo -e "${YELLOW}Setting up Nginx (HTTP only)...${NC}"
cp kijumbesmart.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/kijumbesmart.conf /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Set up SSL with Let's Encrypt
echo -e "${YELLOW}Setting up SSL with Let's Encrypt...${NC}"
certbot --nginx -d kijumbesmart.co.tz -d www.kijumbesmart.co.tz --non-interactive --agree-tos --email admin@kijumbesmart.co.tz
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Warning: Failed to set up SSL certificates automatically. Will continue without SSL.${NC}"
  echo -e "${YELLOW}You can manually set up SSL later with: certbot --nginx -d kijumbesmart.co.tz -d www.kijumbesmart.co.tz${NC}"
fi

# Final restart
echo -e "${YELLOW}Restarting services...${NC}"
systemctl restart nginx
systemctl restart kijumbesmart.service

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}KijumbeSmart application is now running on https://kijumbesmart.co.tz${NC}"
