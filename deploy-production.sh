#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting deployment to kijumbesmart.co.tz...${NC}"

# Function to check command status
check_status() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}$1 failed!${NC}"
        exit 1
    fi
}

# 1. Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
check_status "Frontend dependency installation"

cd server
npm install
check_status "Server dependency installation"
cd ..

# 2. Build the application
echo -e "${YELLOW}Building frontend...${NC}"
npm run build
check_status "Frontend build"

echo -e "${YELLOW}Building server...${NC}"
cd server && npm run build && cd ..
check_status "Server build"

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

# 2. Create necessary directories
echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p ejabberd/{conf,database,logs}
mkdir -p janus/conf

# 3. Check if nginx-proxy network exists
echo -e "${YELLOW}Checking Docker networks...${NC}"
if ! docker network ls | grep -q nginx-proxy-network; then
    echo -e "${YELLOW}Creating nginx-proxy network...${NC}"
    docker network create nginx-proxy-network
fi

# 4. Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down

# 5. Build and start containers
echo -e "${YELLOW}Starting containers...${NC}"
docker-compose -f docker-compose.yml up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start containers!${NC}"
    exit 1
fi

# 6. Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# 7. Check service status
echo -e "${YELLOW}Checking service status...${NC}"
docker-compose ps

# 8. Show logs
echo -e "${YELLOW}Recent logs:${NC}"
docker-compose logs --tail=20

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${GREEN}Application is now available at https://kijumbesmart.co.tz${NC}"
echo -e "${YELLOW}Please check the logs for any errors:${NC}"
echo "  docker-compose logs -f"
