#!/bin/bash

# Master setup script for KijumbeSmart application

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting KijumbeSmart application setup...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Make all scripts executable
chmod +x *.sh

# Step 1: Install dependencies
echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
./install-dependencies.sh
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to install dependencies. Exiting.${NC}"
  exit 1
fi

# Step 2: Update environment files
echo -e "${YELLOW}Step 2: Updating environment files...${NC}"
node update-env.js
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to update environment files. Exiting.${NC}"
  exit 1
fi

# Step 3: Build the application
echo -e "${YELLOW}Step 3: Building the application...${NC}"
npm install
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build the application. Exiting.${NC}"
  exit 1
fi

# Step 4: Set up PM2
echo -e "${YELLOW}Step 4: Setting up PM2...${NC}"
pm2 start ecosystem.config.js --env production
pm2 startup systemd
pm2 save
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to set up PM2. Exiting.${NC}"
  exit 1
fi

# Step 5: Set up systemd service
echo -e "${YELLOW}Step 5: Setting up systemd service...${NC}"
cp kijumbesmart.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable kijumbesmart.service
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to set up systemd service. Exiting.${NC}"
  exit 1
fi

# Step 6: Set up Nginx (HTTP only first)
echo -e "${YELLOW}Step 6: Setting up Nginx (HTTP only)...${NC}"
cp kijumbesmart.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/kijumbesmart.conf /etc/nginx/sites-enabled/
nginx -t
if [ $? -ne 0 ]; then
  echo -e "${RED}Nginx configuration test failed. Exiting.${NC}"
  exit 1
fi
systemctl restart nginx

# Step 7: Set up SSL with Let's Encrypt
echo -e "${YELLOW}Step 7: Setting up SSL with Let's Encrypt...${NC}"
certbot --nginx -d kijumbesmart.co.tz -d www.kijumbesmart.co.tz --non-interactive --agree-tos --email admin@kijumbesmart.co.tz
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Warning: Failed to set up SSL certificates automatically. Will continue without SSL.${NC}"
  echo -e "${YELLOW}You can manually set up SSL later with: certbot --nginx -d kijumbesmart.co.tz -d www.kijumbesmart.co.tz${NC}"
fi

# Step 8: Set up cron jobs
echo -e "${YELLOW}Step 8: Setting up cron jobs...${NC}"
./setup-cron.sh
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to set up cron jobs. Exiting.${NC}"
  exit 1
fi

# Step 9: Final restart
echo -e "${YELLOW}Step 9: Performing final restart...${NC}"
systemctl restart nginx
systemctl restart kijumbesmart.service

# Step 10: Run health check
echo -e "${YELLOW}Step 10: Running health check...${NC}"
./health-check.sh

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}KijumbeSmart application is now running on https://kijumbesmart.co.tz${NC}"
echo -e "${GREEN}The application is configured to run on port 2025 and will start automatically on system boot.${NC}"
