#!/bin/bash

# ============================================
# Switch App - Production Setup Script
# Automated setup for kijumbesmart.co.tz:2025
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

print_header "Switch App - Production Setup"

# Step 1: Update system
print_info "Step 1/8: Updating system..."
apt-get update -qq
apt-get upgrade -y -qq
print_success "System updated"

# Step 2: Install dependencies
print_info "Step 2/8: Installing dependencies..."
apt-get install -y -qq \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    nano
print_success "Dependencies installed"

# Step 3: Install Docker
print_info "Step 3/8: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    usermod -aG docker $SUDO_USER || true
    print_success "Docker installed"
else
    print_success "Docker already installed"
fi

# Step 4: Install Docker Compose
print_info "Step 4/8: Installing Docker Compose..."
if ! docker compose version &> /dev/null; then
    apt-get install -y docker-compose-plugin
    print_success "Docker Compose installed"
else
    print_success "Docker Compose already installed"
fi

# Step 5: Configure firewall
print_info "Step 5/8: Configuring firewall..."
ufw --force enable
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 2025/tcp comment 'Switch App'
print_success "Firewall configured"

# Step 6: Setup environment
print_info "Step 6/8: Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    print_warning "Created .env file from template"
    print_info "Please edit .env with your configuration:"
    echo "  - VITE_APPWRITE_PROJECT_ID"
    echo "  - VITE_APPWRITE_DATABASE_ID"
    echo "  - VITE_APPWRITE_API_KEY"
    echo "  - EJABBERD_ADMIN_PWD"
    read -p "Press Enter to edit .env file..." 
    nano .env
    print_success "Environment configured"
else
    print_success "Environment file exists"
fi

# Step 7: Setup SSL (optional)
print_info "Step 7/8: SSL Setup..."
read -p "Do you want to setup SSL with Let's Encrypt? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    apt-get install -y certbot python3-certbot-nginx
    print_info "Stopping nginx temporarily..."
    docker compose stop nginx 2>/dev/null || true
    
    read -p "Enter your domain (e.g., kijumbesmart.co.tz): " DOMAIN
    read -p "Enter your email: " EMAIL
    
    certbot certonly --standalone -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    if [ $? -eq 0 ]; then
        print_success "SSL certificate obtained"
        
        # Setup auto-renewal
        (crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet && docker compose restart nginx") | crontab -
        print_success "Auto-renewal configured"
    else
        print_warning "SSL setup failed. You can run certbot manually later."
    fi
else
    print_info "Skipping SSL setup"
fi

# Step 8: Build and start
print_info "Step 8/8: Building and starting application..."
docker compose build --no-cache
docker compose up -d
print_success "Application started"

# Wait for health check
print_info "Waiting for application to be healthy..."
sleep 15

MAX_ATTEMPTS=30
ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -f -s http://localhost:2025/health > /dev/null 2>&1; then
        print_success "Application is healthy!"
        break
    fi
    echo -n "."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    print_error "Application failed to start. Check logs with: docker compose logs"
    exit 1
fi

# Show status
print_header "Setup Complete!"
print_success "Switch App is now running on kijumbesmart.co.tz:2025"
echo ""
print_info "Service Status:"
docker compose ps
echo ""
print_info "Access your application:"
echo "  - Local:  http://localhost:2025"
echo "  - Domain: http://kijumbesmart.co.tz:2025"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  - HTTPS:  https://kijumbesmart.co.tz:2025"
fi
echo ""
print_info "Useful commands:"
echo "  - View logs:        docker compose logs -f"
echo "  - Stop services:    docker compose stop"
echo "  - Start services:   docker compose start"
echo "  - Restart services: docker compose restart"
echo "  - Update app:       git pull && docker compose up -d --build"
echo ""
print_info "Next steps:"
echo "  1. Configure your Appwrite collections (see APPWRITE_SETUP.md)"
echo "  2. Test all features (chat, streaming, payments)"
echo "  3. Setup monitoring and backups"
echo ""
print_success "Setup completed successfully!"
