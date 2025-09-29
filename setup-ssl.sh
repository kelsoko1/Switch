#!/bin/bash

# This script sets up SSL for the KijumbeSmart application
# Run this after the domain is properly configured and pointing to your server

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up SSL for KijumbeSmart application...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
  echo -e "${YELLOW}Installing certbot...${NC}"
  apt-get update
  apt-get install -y certbot python3-certbot-nginx
fi

# Check if the domain is accessible
echo -e "${YELLOW}Checking if the domain is accessible...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://93.127.203.151:2025)
if [ "$HTTP_STATUS" != "200" ]; then
  echo -e "${RED}Domain 93.127.203.151:2025 is not accessible (HTTP status: $HTTP_STATUS)${NC}"
  echo -e "${RED}Make sure the domain is properly configured and pointing to your server.${NC}"
  exit 1
fi

# Set up SSL with Let's Encrypt
echo -e "${YELLOW}Setting up SSL with Let's Encrypt...${NC}"
certbot --nginx -d 93.127.203.151:2025 -d www.93.127.203.151:2025

# Check if SSL setup was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}SSL setup completed successfully!${NC}"
  echo -e "${GREEN}KijumbeSmart application is now accessible via HTTPS: https://93.127.203.151:2025${NC}"
else
  echo -e "${RED}Failed to set up SSL certificates.${NC}"
  echo -e "${RED}Please check the certbot error messages above.${NC}"
  exit 1
fi

# Restart Nginx
echo -e "${YELLOW}Restarting Nginx...${NC}"
systemctl restart nginx

# Check if HTTPS is working
echo -e "${YELLOW}Checking if HTTPS is working...${NC}"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k https://93.127.203.151:2025)
if [ "$HTTPS_STATUS" != "200" ]; then
  echo -e "${RED}HTTPS is not working properly (HTTP status: $HTTPS_STATUS)${NC}"
  echo -e "${RED}Please check the Nginx error logs: /var/log/nginx/error.log${NC}"
else
  echo -e "${GREEN}HTTPS is working properly!${NC}"
fi

echo -e "${GREEN}SSL setup process completed!${NC}"
