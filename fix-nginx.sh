#!/bin/bash

# This script fixes the Nginx configuration for the KijumbeSmart application

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing Nginx configuration for KijumbeSmart application...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Create a backup of the current configuration
echo -e "${YELLOW}Creating backup of current Nginx configuration...${NC}"
cp /etc/nginx/sites-available/kijumbesmart.conf /etc/nginx/sites-available/kijumbesmart.conf.bak

# Create a basic HTTP configuration
echo -e "${YELLOW}Creating basic HTTP configuration...${NC}"
cat > /etc/nginx/sites-available/kijumbesmart.conf << EOF
server {
    listen 80;
    server_name kijumbesmart.co.tz:2025 www.kijumbesmart.co.tz:2025;
    
    # Root directory and index file
    root /root/switch/dist;
    index index.html;

    # Optimize for production
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        application/javascript
        application/json
        application/x-javascript
        application/xml
        application/xml+rss
        text/css
        text/javascript
        text/plain
        text/xml;

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
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Media files
    location ~* \\.(jpg|jpeg|png|gif|ico|svg|webp)\$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }

    # CSS and JavaScript
    location ~* \\.(css|js)\$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Test the configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
nginx -t

# If the test is successful, restart Nginx
if [ $? -eq 0 ]; then
  echo -e "${YELLOW}Restarting Nginx...${NC}"
  systemctl restart nginx
  echo -e "${GREEN}Nginx configuration fixed successfully!${NC}"
else
  echo -e "${RED}Nginx configuration test failed. Please check the error messages above.${NC}"
  echo -e "${YELLOW}Restoring backup configuration...${NC}"
  cp /etc/nginx/sites-available/kijumbesmart.conf.bak /etc/nginx/sites-available/kijumbesmart.conf
  exit 1
fi
