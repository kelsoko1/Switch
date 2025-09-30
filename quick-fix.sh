#!/bin/bash

# This script provides a quick fix for common deployment issues

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running quick fix for KijumbeSmart deployment...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Fix 1: Reset Nginx configuration to HTTP only
echo -e "${YELLOW}Fix 1: Resetting Nginx configuration to HTTP only...${NC}"
cat > /etc/nginx/sites-available/kijumbesmart.conf << EOF
server {
    listen 80;
    server_name kijumbesmart.co.tz:2025 www.kijumbesmart.co.tz:2025;
    
    # Root directory and index file
    root /root/switch/dist;
    index index.html;

    # API proxy
    location /api {
        proxy_pass http://localhost:2025;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Test and reload Nginx
nginx -t && systemctl restart nginx
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Nginx configuration fixed${NC}"
else
  echo -e "${RED}× Failed to fix Nginx configuration${NC}"
fi

# Fix 2: Make sure the application is running on port 2025
echo -e "${YELLOW}Fix 2: Ensuring application is running on port 2025...${NC}"
PORT_CHECK=$(netstat -tuln | grep 2025)
if [ -z "$PORT_CHECK" ]; then
  echo -e "${YELLOW}Application is not running on port 2025. Starting it...${NC}"
  cd /root/switch
  pm2 delete kijumbesmart-app 2>/dev/null
  PORT=2025 NODE_ENV=production pm2 start server/index.js --name kijumbesmart-app
  pm2 save
  
  # Check if that worked
  sleep 5
  PORT_CHECK=$(netstat -tuln | grep 2025)
  if [ -z "$PORT_CHECK" ]; then
    echo -e "${RED}× Failed to start application on port 2025${NC}"
  else
    echo -e "${GREEN}✓ Application is now running on port 2025${NC}"
  fi
else
  echo -e "${GREEN}✓ Application is already running on port 2025${NC}"
fi

# Fix 3: Update environment files
echo -e "${YELLOW}Fix 3: Updating environment files...${NC}"
cd /root/switch
node update-env.js
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Environment files updated${NC}"
else
  echo -e "${RED}× Failed to update environment files${NC}"
fi

# Fix 4: Restart services
echo -e "${YELLOW}Fix 4: Restarting services...${NC}"
systemctl restart nginx
pm2 restart kijumbesmart-app
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Services restarted${NC}"
else
  echo -e "${RED}× Failed to restart services${NC}"
fi

echo -e "${YELLOW}Quick fix completed. The application should now be accessible at http://kijumbesmart.co.tz:2025${NC}"
echo -e "${YELLOW}After confirming that the application is working, you can set up SSL with:${NC}"
echo -e "${YELLOW}sudo ./setup-ssl.sh${NC}"
