#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check command status
check_command() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error: $1${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Success: $1${NC}"
    fi
}

echo -e "${YELLOW}🚀 Starting deployment to 93.127.203.151:2025...${NC}"

# Create required directories
echo -e "${YELLOW}📁 Creating required directories...${NC}"
mkdir -p nginx/conf.d nginx/ssl
mkdir -p ejabberd/{conf,database,logs}
mkdir -p janus/conf
check_command "Created required directories"

# Create Docker network
echo -e "${YELLOW}🌐 Setting up Docker network...${NC}"
docker network create nginx-proxy-network || true
check_command "Set up Docker network"

# Clean up previous build artifacts
echo -e "${YELLOW}🧹 Cleaning up previous builds...${NC}"
rm -rf dist server/dist
check_command "Cleaned up previous build artifacts"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
check_command "Installed frontend dependencies"

cd server
npm install
check_command "Installed server dependencies"
cd ..

# Build the application
echo -e "${YELLOW}🏗️ Building application...${NC}"
npm run build
check_command "Built frontend"

echo -e "${YELLOW}🏗️ Building server...${NC}"
cd server && npm run build && cd ..
check_command "Built server"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down
check_command "Stopped existing containers"

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
echo -e "${YELLOW}⌛ Waiting for services to start...${NC}"
sleep 10

# Check container status
echo -e "${YELLOW}🔍 Checking container status...${NC}"
docker-compose ps

# Show logs
echo -e "${YELLOW}📜 Recent logs:${NC}"
docker-compose logs --tail=50

echo -e "${GREEN}✨ Deployment complete! The application should be accessible at:${NC}"
echo -e "   - ${YELLOW}http://93.127.203.151:2025${NC}"
echo -e "   - ${YELLOW}https://93.127.203.151:2025${NC} (once DNS propagates)"

echo -e "
${YELLOW}📝 To monitor logs, run:${NC}"
echo "   docker-compose logs -f"

echo -e "
${RED}❗ Don't forget to:${NC}"
echo "   1. Check if DNS is properly configured"
echo "   2. Verify SSL certificate if using HTTPS"
echo "   3. Test all features (auth, real-time, etc.)"
