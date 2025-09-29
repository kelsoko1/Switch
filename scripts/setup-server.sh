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

echo -e "${YELLOW}🚀 Starting server setup for $APP_NAME...${NC}"

# Update system
echo -e "${YELLOW}🔄 Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install required packages
echo -e "${YELLOW}📦 Installing required packages...${NC}"
apt-get install -y \
  nginx \
  nodejs \
  npm \
  certbot \
  python3-certbot-nginx \
  build-essential \
  git \
  ufw \
  fail2ban \
  htop \
  net-tools

# Install Node.js 18.x if not already installed
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
  echo -e "${YELLOW}⬇️  Installing Node.js 18.x...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Install PM2 process manager
echo -e "${YELLOW}📦 Installing PM2 process manager...${NC}"
npm install -g pm2

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

# Set up firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo -e "${GREEN}✅ Server setup completed successfully!${NC}"
echo -e "\n${YELLOW}📝 Next steps:${NC}"
echo "1. Copy your application files to $APP_DIR"
echo "2. Run 'cd $APP_DIR && npm install' to install dependencies"
echo "3. Run 'npm run build' to build the application"
echo "4. Configure Nginx and SSL as needed"
echo -e "\n${GREEN}🎉 Your server is now ready for deployment!${NC}"
