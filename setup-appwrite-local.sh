#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure script is run with bash
if [ -z "$BASH_VERSION" ]; then
    echo -e "${RED}Please run this script with bash${NC}"
    exit 1
fi

# Check dependencies
check_dependencies() {
    echo -e "${YELLOW}Checking system dependencies...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Docker Compose is not installed. Please install Docker Compose.${NC}"
        exit 1
    fi
}

# Install Appwrite locally
install_appwrite() {
    echo -e "${YELLOW}Setting up Appwrite local environment...${NC}"
    
    # Create Appwrite directory
    mkdir -p ~/appwrite-local
    cd ~/appwrite-local

    # Download Appwrite Docker Compose
    echo -e "${YELLOW}Downloading Appwrite Docker Compose...${NC}"
    curl -L https://appwrite.io/install/compose.yml -o docker-compose.yml

    # Start Appwrite services
    echo -e "${YELLOW}Starting Appwrite services...${NC}"
    docker-compose up -d

    # Wait for Appwrite to start
    echo -e "${YELLOW}Waiting for Appwrite to initialize (60 seconds)...${NC}"
    sleep 60
}

# Configure Appwrite project
configure_project() {
    echo -e "${GREEN}🚀 Appwrite local setup complete!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Open http://localhost:80 in your browser"
    echo "2. Login with default credentials:"
    echo "   - Email: admin@appwrite.io"
    echo "   - Password: password"
    echo "3. Create a new project named 'Kijumbe Local'"
    echo "4. Note down Project ID and API Keys"
    echo "5. Update your .env file with the new credentials"
}

# Main execution
main() {
    check_dependencies
    install_appwrite
    configure_project
}

# Run main function
main
