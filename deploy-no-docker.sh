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
NGINX_CONF_DIR="/etc/nginx/conf.d"
SYSTEMD_DIR="/etc/systemd/system"
ENV_FILE=".env.production"
DOMAIN="93.127.203.151"
PORTS=("2025" "2026" "2027")

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root${NC}"
  exit 1
fi

echo -e "${YELLOW}🚀 Starting non-Docker deployment of $APP_NAME...${NC}"

# Install required packages
echo -e "${YELLOW}📦 Installing required packages...${NC}"
apt-get update
apt-get install -y \
  nginx \
  nodejs \
  npm \
  certbot \
  python3-certbot-nginx \
  build-essential \
  git

# Install Node.js 18.x if not already installed
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
  echo -e "${YELLOW}⬇️  Installing Node.js 18.x...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Create application user if not exists
if ! id "$APP_USER" &>/dev/null; then
  echo -e "${YELLOW}👤 Creating application user...${NC}"
  useradd -m -d "$APP_DIR" -s /bin/bash "$APP_USER"
else
  echo -e "${YELLOW}ℹ️  User $APP_USER already exists${NC}"
fi

# Set up application directory
echo -e "${YELLOW}📂 Setting up application directory...${NC}"
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# Copy application files
echo -e "${YELLOW}📦 Copying application files...${NC}"
rsync -av --exclude='node_modules' --exclude='.git' --exclude='.env*' . "$APP_DIR/"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# Install dependencies
echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
sudo -u "$APP_USER" bash -c "cd $APP_DIR && npm install"
sudo -u "$APP_USER" bash -c "cd $APP_DIR/server && npm install"

# Build frontend
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
sudo -u "$APP_USER" bash -c "cd $APP_DIR && npm run build"

# Configure environment file
if [ ! -f "$APP_DIR/$ENV_FILE" ]; then
  echo -e "${YELLOW}⚙️  Creating production environment file...${NC}"
  cat > "$APP_DIR/$ENV_FILE" <<EOL
# Server Configuration
VITE_PORT=2025
VITE_NODE_ENV=production
VITE_FRONTEND_URL=https://$DOMAIN:2025

# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68ac2652001ca468e987
VITE_APPWRITE_DATABASE_ID=68ac3f000002c33d8048
VITE_APPWRITE_API_KEY=standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498

# Collection IDs
VITE_COLLECTION_USERS=users
VITE_COLLECTION_GROUPS=groups
VITE_COLLECTION_MEMBERS=members
VITE_COLLECTION_TRANSACTIONS=transactions
VITE_COLLECTION_PAYMENTS=payments
VITE_COLLECTION_OVERDRAFTS=overdrafts
VITE_COLLECTION_WHATSAPP_MESSAGES=whatsapp_messages
VITE_COLLECTION_WALLETS=wallets
VITE_COLLECTION_WALLET_TRANSACTIONS=wallet_transactions
EOL
  chown "$APP_USER:$APP_USER" "$APP_DIR/$ENV_FILE"
  chmod 600 "$APP_DIR/$ENV_FILE"
else
  echo -e "${YELLOW}ℹ️  Environment file already exists${NC}"
fi

# Create systemd service for backend
echo -e "${YELLOW}⚙️  Creating systemd service for backend...${NC}"
cat > "/etc/systemd/system/${APP_NAME}.service" <<EOL
[Unit]
Description=Switch Backend Service
After=network.target

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR/server
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$APP_NAME

[Install]
WantedBy=multi-user.target
EOL

# Enable and start the service
systemctl daemon-reload
systemctl enable "${APP_NAME}.service"
systemctl restart "${APP_NAME}.service"

# Configure Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
cat > "/etc/nginx/sites-available/$APP_NAME" <<EOL
server {
    listen 2025 ssl;
    listen [::]:2025 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    location / {
        root $APP_DIR/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';";
}
EOL

# Enable the site
ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Set up SSL with Let's Encrypt
echo -e "${YELLOW}🔐 Setting up SSL with Let's Encrypt...${NC}"
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect
  systemctl restart nginx
else
  echo -e "${YELLOW}ℹ️  SSL certificate already exists${NC}"
fi

# Set up firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
for port in "${PORTS[@]}"; do
  ufw allow "$port/tcp"
done
ufw --force enable

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "\n${YELLOW}🌍 Your application should now be accessible at: https://$DOMAIN:2025${NC}"
echo -e "\n${YELLOW}📝 Next steps:${NC}"
echo "1. Check the application status: systemctl status $APP_NAME"
echo "2. View application logs: journalctl -u $APP_NAME -f"
echo "3. Check Nginx logs: journalctl -u nginx -f"
echo -e "\n${GREEN}🎉 Enjoy your deployment!${NC}"
