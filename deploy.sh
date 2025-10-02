#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="kijumbesmart"
DOCKER_NETWORK="${APP_NAME}-network"
DOCKER_VOLUME="${APP_NAME}-data"
ENV_FILE=".env"
BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${YELLOW}🚀 Starting deployment of KijumbeSmart application...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root${NC}"
  exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose.${NC}"
    exit 1
fi

# Function to create backup
create_backup() {
    echo -e "${BLUE}📦 Creating backup...${NC}"
    mkdir -p "${BACKUP_DIR}"
    
    # Create backup of current setup
    if [ -d "/root/Switch" ]; then
        echo -e "${BLUE}🔍 Found existing Switch directory, creating backup...${NC}"
        tar -czf "${BACKUP_DIR}/switch_backup_${TIMESTAMP}.tar.gz" -C /root Switch
        echo -e "${GREEN}✅ Backup created at ${BACKUP_DIR}/switch_backup_${TIMESTAMP}.tar.gz${NC}"
    fi
}

# Check if required ports are available
echo -e "${YELLOW}🔍 Checking if required ports are available...${NC}"

# List of required ports and their services
declare -A ports=(
    [2025]="Main Application"
    [2026]="XMPP WebSocket"
    [2027]="XMPP c2s"
    [2028]="XMPP s2s"
    [2029]="XMPP HTTP Upload"
    [5222]="XMPP client connections"
    [5269]="XMPP server-to-server"
    [5280]="XMPP HTTP Bind"
    [5281]="XMPP HTTPS Bind"
    [8088]="Janus REST API"
    [8188]="Janus WebSocket API"
    [8989]="Janus Admin/Monitor"
)

check_port() {
    local port=$1
    local service=$2
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${RED}❌ Port $port is already in use by another service ($service)${NC}"
        exit 1
    fi
}

# Check each port
for port in "${!ports[@]}"; do
    check_port "$port" "${ports[$port]}"
done

echo -e "${GREEN}✅ All required ports are available${NC}"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}ℹ️  Please edit the .env file with your configuration and run this script again.${NC}"
        exit 1
    else
        echo -e "${RED}❌ .env.example file not found. Please create a .env file.${NC}"
        exit 1
    fi
fi

# Load and validate environment variables
validate_env() {
    echo -e "${YELLOW}🔍 Validating environment variables...${NC}"
    
    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}❌ .env file not found. Please create one from .env.example${NC}"
        exit 1
    fi
    
    # Load environment variables
    set -a
    source "$ENV_FILE"
    set +a
    
    # List of required environment variables
    local required_vars=(
        "VITE_APPWRITE_API_KEY"
    )
    
    # Optional environment variables (will warn if missing but continue)
    local optional_vars=(
        "VITE_SELCOM_API_KEY"
        "VITE_SELCOM_API_SECRET"
        "VITE_SELCOM_MERCHANT_ID"
    )
    
    # Check each required variable
    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    # Report missing variables
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required environment variables:${NC}"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    # Check optional variables
    local missing_optional=()
    for var in "${optional_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_optional+=("$var")
        fi
    done
    
    if [ ${#missing_optional[@]} -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Missing optional environment variables (will continue):${NC}"
        for var in "${missing_optional[@]}"; do
            echo "  - $var"
        done
    fi
    
    echo -e "${GREEN}✅ Environment validation complete${NC}"
}

# Load and validate environment
validate_env

# Create Docker network if it doesn't exist
if ! docker network inspect $DOCKER_NETWORK &> /dev/null; then
    echo -e "${YELLOW}🌐 Creating Docker network: ${DOCKER_NETWORK}...${NC}"
    docker network create $DOCKER_NETWORK
fi

# Create Docker volume if it doesn't exist
if ! docker volume inspect $DOCKER_VOLUME &> /dev/null; then
    echo -e "${YELLOW}💾 Creating Docker volume: ${DOCKER_VOLUME}...${NC}"
    docker volume create $DOCKER_VOLUME
fi

# Create backup before proceeding
create_backup

# Build and start containers
echo -e "${YELLOW}🚀 Building and starting containers...${NC}"

# Pull the latest changes
if [ -d ".git" ]; then
    echo -e "${YELLOW}🔄 Pulling latest changes from git...${NC}"
    git pull
else
    echo -e "${YELLOW}ℹ️  Not a git repository, skipping git pull${NC}"
fi

# Stop and remove existing containers if they exist
echo -e "${YELLOW}🛑 Stopping and removing existing containers...${NC}"
docker-compose down || true

# Build the Docker images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
# Export environment variables for docker-compose
export $(grep -v '^#' .env | xargs)
docker-compose build --no-cache

# Configure firewall
configure_firewall() {
    echo -e "${YELLOW}🔧 Configuring firewall...${NC}"
    
    # Enable UFW if not enabled
    if ! ufw status | grep -q "Status: active"; then
        echo -e "${YELLOW}⚠️  UFW is not active. Enabling UFW...${NC}"
        ufw --force enable
    fi
    
    # Allow required ports
    for port in "${!ports[@]}"; do
        ufw allow $port/tcp
        ufw allow $port/udp
        echo -e "✅ Allowed port $port (${ports[$port]})"
    done
    
    # Reload UFW
    ufw reload
    echo -e "${GREEN}✅ Firewall configured successfully${NC}"
}

# Only configure firewall if running as root
if [ "$EUID" -eq 0 ]; then
    configure_firewall
fi

# Function to wait for service to be healthy
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Waiting for $service to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port; then
            echo -e "${GREEN}✅ $service is ready!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Waiting for $service (attempt $attempt/$max_attempts)...${NC}"
        sleep 5
        ((attempt++))
    done
    
    echo -e "${RED}❌ Timed out waiting for $service${NC}"
    return 1
}

# Start the application
echo -e "\n${YELLOW}🚀 Starting $APP_NAME...${NC}"

# Create necessary directories if they don't exist
echo -e "${YELLOW}📂 Setting up directories...${NC}"
mkdir -p /root/Switch/data

# Copy necessary files to /root/Switch
echo -e "${YELLOW}📋 Copying configuration files...${NC}"
mkdir -p /root/Switch
cp docker-compose.yml /root/Switch/
cp .env /root/Switch/
cp switch-app.service /root/Switch/
cp caddy-snippet.conf /root/Switch/

# Inform about Caddy configuration
echo -e "${YELLOW}ℹ️  Caddy configuration snippet has been created at /root/Switch/caddy-snippet.conf"
echo -e "   Please add this to your main Caddyfile and reload Caddy:"
echo -e "   ${CYAN}sudo systemctl reload caddy${NC}"

# Install systemd service if not already installed
if [ ! -f /etc/systemd/system/switch-app.service ]; then
    echo -e "${YELLOW}🔧 Installing systemd service...${NC}"
    cp switch-app.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable switch-app.service
fi

# Build and start the service
echo -e "${YELLOW}🚀 Building and starting Switch service...${NC}"
cd /root/Switch

# Stop and remove any existing containers
echo -e "${YELLOW}🛑 Stopping any running containers...${NC}
docker-compose down || true

# Pull the latest changes (if using git)
if [ -d .git ]; then
    echo -e "${YELLOW}🔄 Pulling latest changes...${NC}
    git pull origin main
fi

# Rebuild the containers
echo -e "${YELLOW}🔨 Rebuilding containers...${NC}
# Export environment variables for docker-compose
export $(grep -v '^#' .env | xargs)
docker-compose build --no-cache

# Start the services
echo -e "${YELLOW}🚀 Starting services...${NC}
# Export environment variables for docker-compose
export $(grep -v '^#' .env | xargs)

# Create required networks if they don't exist
if ! docker network inspect nginx-proxy-network &> /dev/null; then
    echo -e "${YELLOW}🌐 Creating nginx-proxy network...${NC}"
    docker network create nginx-proxy-network
fi

if ! docker-compose up -d; then
    echo -e "${RED}❌ Failed to start services${NC}"
    echo -e "${YELLOW}🔄 Attempting to recover...${NC}"
    docker-compose down
    sleep 5
    if ! docker-compose up -d; then
        echo -e "${RED}❌ Failed to recover services${NC}"
        exit 1
    fi
fi

# Wait for services to be ready
wait_for_service "Main Application" 2025
wait_for_service "XMPP Server" 5222
wait_for_service "Janus" 8188

# Restart the systemd service to ensure it's using the latest configuration
echo -e "${YELLOW}🔄 Restarting systemd service...${NC}
systemctl daemon-reload
systemctl restart switch-app.service

# Check service status
echo -e "\n${YELLOW}📡 Checking service status...${NC}"
if systemctl is-active --quiet switch-app.service; then
    echo -e "${GREEN}✅ Switch service is running!${NC}"
else
    echo -e "${RED}❌ Switch service failed to start. Check logs with: journalctl -u switch-app -f${NC}"
    exit 1
fi

# Show service logs
echo -e "\n${YELLOW}📜 Showing recent logs (press Ctrl+C to exit):${NC}"
journalctl -u switch-app -n 10 --no-pager

echo -e "\n${GREEN}✅ Deployment complete! The application will continue to run even after you log out.${NC}"
echo -e "\n${YELLOW}📝 Service Management Commands:${NC}"
echo -e "  View logs:              ${CYAN}journalctl -u switch-app -f${NC}"
echo -e "  View recent logs:       ${CYAN}journalctl -u switch-app -n 50${NC}"
echo -e "  Restart service:        ${CYAN}systemctl restart switch-app${NC}"
echo -e "  Stop service:           ${CYAN}systemctl stop switch-app${NC}"
echo -e "  View service status:    ${CYAN}systemctl status switch-app${NC}"
echo -e "  View container logs:    ${CYAN}docker-compose -f /root/Switch/docker-compose.yml logs -f${NC}"

echo -e "\n${YELLOW}🔍 To monitor the application:${NC}"
echo -e "  Frontend:    https://kijumbesmart.co.tz:2025"
echo -e "  API docs:    https://kijumbesmart.co.tz:2026/docs"
echo -e "  XMPP WS:     wss://kijumbesmart.co.tz:2027/ws"

echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"

# Check if containers are running
if [ "$(docker-compose ps -q | wc -l)" -gt 0 ]; then
    echo -e "${GREEN}✅ Containers started successfully!${NC}"
    
    # Show container status
    echo -e "\n${YELLOW}📊 Container Status:${NC}"
    docker-compose ps
    
    # Show logs for a few seconds
    echo -e "\n${YELLOW}📝 Checking logs (press Ctrl+C to continue)...${NC}"
    timeout 5s docker-compose logs -f || true
    
    # Show application URL
    echo -e "\n${GREEN}🌍 Application should be available at: https://kijumbesmart.co.tz:2025${NC}"
else
    echo -e "${RED}❌ Failed to start containers. Check the logs with: docker-compose logs${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
docker system prune -f

echo -e "\n${GREEN}✨ Deployment completed successfully!${NC}"

echo -e "\n${YELLOW}🔍 To check the logs:${NC}"
echo "docker-compose logs -f"

echo -e "\n${YELLOW}🛠️  Useful commands:${NC}"
echo "- Stop containers: docker-compose down"
echo "- View logs:       docker-compose logs -f"
echo "- View processes:  docker-compose ps"
echo "- Access shell:    docker-compose exec app sh"

echo -e "\n${GREEN}🌍 Your application is now running at: https://kijumbesmart.co.tz:2025${NC}"
echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
