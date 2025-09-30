#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Performing health check for KijumbeSmart application...${NC}"

# Check if the application is running on port 2025
PORT_CHECK=$(netstat -tuln | grep 2025)
if [ -z "$PORT_CHECK" ]; then
  echo -e "${RED}ERROR: Application is not running on port 2025${NC}"
else
  echo -e "${GREEN}✓ Application is running on port 2025${NC}"
fi

# Check if PM2 is managing the application
PM2_CHECK=$(pm2 list | grep kijumbesmart-app)
if [ -z "$PM2_CHECK" ]; then
  echo -e "${RED}ERROR: PM2 is not managing the application${NC}"
else
  echo -e "${GREEN}✓ PM2 is managing the application${NC}"
fi

# Check if Nginx is running
NGINX_CHECK=$(systemctl is-active nginx)
if [ "$NGINX_CHECK" != "active" ]; then
  echo -e "${RED}ERROR: Nginx is not running${NC}"
else
  echo -e "${GREEN}✓ Nginx is running${NC}"
fi

# Check if the systemd service is active
SERVICE_CHECK=$(systemctl is-active kijumbesmart.service)
if [ "$SERVICE_CHECK" != "active" ]; then
  echo -e "${RED}ERROR: kijumbesmart.service is not active${NC}"
else
  echo -e "${GREEN}✓ kijumbesmart.service is active${NC}"
fi

# Check if the website is accessible
WEBSITE_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://kijumbesmart.co.tz:2025)
if [ "$WEBSITE_CHECK" != "200" ]; then
  echo -e "${RED}ERROR: Website is not accessible (HTTP status: $WEBSITE_CHECK)${NC}"
else
  echo -e "${GREEN}✓ Website is accessible${NC}"
fi

# Check API health endpoint
API_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://kijumbesmart.co.tz:2025/api/health)
if [ "$API_CHECK" != "200" ]; then
  echo -e "${RED}ERROR: API health endpoint is not accessible (HTTP status: $API_CHECK)${NC}"
else
  echo -e "${GREEN}✓ API health endpoint is accessible${NC}"
fi

# Check SSL certificate expiration
DOMAIN="kijumbesmart.co.tz:2025"
SSL_EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
SSL_EXPIRY_SECONDS=$(date -d "$SSL_EXPIRY" +%s)
CURRENT_SECONDS=$(date +%s)
DAYS_LEFT=$(( ($SSL_EXPIRY_SECONDS - $CURRENT_SECONDS) / 86400 ))

if [ $DAYS_LEFT -lt 30 ]; then
  echo -e "${RED}WARNING: SSL certificate will expire in $DAYS_LEFT days${NC}"
else
  echo -e "${GREEN}✓ SSL certificate is valid for $DAYS_LEFT more days${NC}"
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
  echo -e "${RED}WARNING: Disk usage is high ($DISK_USAGE%)${NC}"
else
  echo -e "${GREEN}✓ Disk usage is acceptable ($DISK_USAGE%)${NC}"
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEM_USAGE -gt 90 ]; then
  echo -e "${RED}WARNING: Memory usage is high ($MEM_USAGE%)${NC}"
else
  echo -e "${GREEN}✓ Memory usage is acceptable ($MEM_USAGE%)${NC}"
fi

echo -e "${YELLOW}Health check completed.${NC}"
