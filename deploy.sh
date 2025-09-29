#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="kijumbesmart"
DOCKER_NETWORK="${APP_NAME}-network"
DOCKER_VOLUME="${APP_NAME}-data"
ENV_FILE=".env"

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

# Load environment variables
export $(grep -v '^#' .env | xargs)

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

# Build and start containers
echo -e "${YELLOW}🚀 Building and starting containers...${NC}"
# Pull the latest changes
git pull

# Build the Docker images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker-compose build --no-cache

# Stop and remove existing containers if they exist
echo -e "${YELLOW}🛑 Stopping and removing existing containers...${NC}"
docker-compose down || true

# Start the containers in detached mode
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose up -d

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
    echo -e "\n${GREEN}🌍 Application should be available at: https://kijumbesmart.co.tz${NC}"
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

echo -e "\n${GREEN}🌍 Your application is now running at: https://kijumbesmart.co.tz${NC}"
echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
