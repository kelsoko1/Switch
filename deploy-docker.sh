#!/bin/bash

# ============================================
# Switch App - Docker Deployment Script
# Domain: kijumbesmart.co.tz
# Port: 2025
# ============================================

set -e

# ============================================
# Configuration - Edit these values
# ============================================
DOMAIN="kijumbesmart.co.tz"
EMAIL="odamo360@gmail.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

print_header "Switch App - Docker Deployment"

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_info "Please edit .env file with your configuration before continuing"
        print_info "Required variables:"
        echo "  - VITE_APPWRITE_API_KEY"
        echo "  - VITE_APPWRITE_PROJECT_ID"
        echo "  - VITE_APPWRITE_DATABASE_ID"
        echo "  - EJABBERD_ADMIN_PWD"
        echo "  - VITE_SELCOM_API_KEY (optional)"
        echo "  - VITE_SELCOM_API_SECRET (optional)"
        echo "  - VITE_SELCOM_MERCHANT_ID (optional)"
        read -p "Press Enter after editing .env file to continue..."
    else
        print_error ".env.example not found. Cannot proceed."
        exit 1
    fi
fi

# Load environment variables
source .env

# Validate required environment variables
print_info "Validating environment variables..."
REQUIRED_VARS=("VITE_APPWRITE_PROJECT_ID" "VITE_APPWRITE_DATABASE_ID" "VITE_APPWRITE_API_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

print_success "Environment variables validated"

# Check if Docker is installed
print_info "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Check Docker daemon
print_info "Checking Docker daemon..."
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running. Please start Docker."
    exit 1
fi

print_success "Docker daemon is running"

# Stop existing containers
print_info "Stopping existing containers..."
docker-compose down || true
print_success "Existing containers stopped"

# Remove old images (optional)
read -p "Do you want to remove old images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Removing old images..."
    docker-compose down --rmi all --volumes || true
    print_success "Old images removed"
fi

# Build images
print_header "Building Docker Images"
docker-compose build --no-cache
print_success "Docker images built successfully"

# Start services
print_header "Starting Services"
docker-compose up -d
print_success "Services started"

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Check service health
print_header "Checking Service Health"

check_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            print_success "$service is healthy"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_error "$service failed to start"
    return 1
}

# Check main app
check_service "Switch App" "http://localhost:2025/health"

# Show running containers
print_header "Running Containers"
docker-compose ps

# Show logs
print_header "Recent Logs"
docker-compose logs --tail=50

# Print success message
print_header "Deployment Complete!"
print_success "Switch App is now running"
echo ""
print_info "Access the application at:"
echo "  - HTTP:  http://kijumbesmart.co.tz:2025"
echo "  - HTTPS: https://kijumbesmart.co.tz:2025"
echo ""
print_info "Useful commands:"
echo "  - View logs:        docker-compose logs -f"
echo "  - Stop services:    docker-compose stop"
echo "  - Start services:   docker-compose start"
echo "  - Restart services: docker-compose restart"
echo "  - Remove all:       docker-compose down -v"
echo ""
print_warning "Note: For HTTPS to work, you need to configure SSL certificates."
print_info "Run: sudo certbot --nginx -d kijumbesmart.co.tz"
echo ""
