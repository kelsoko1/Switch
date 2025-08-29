#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${YELLOW}[NETWORK DEBUG]${NC} $1"
}

# Error handling function
error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Docker network configuration
debug_docker_networks() {
    log "Checking Docker network configuration..."

    # List all Docker networks
    log "${GREEN}Available Docker Networks:${NC}"
    docker network ls

    # Check Docker system info
    log "${GREEN}Docker System Information:${NC}"
    docker info

    # Check for any network-related issues
    log "${GREEN}Docker Network Troubleshooting:${NC}"
    
    # Check Docker daemon configuration
    log "Checking Docker daemon configuration..."
    docker version

    # Check for any network conflicts
    log "Checking for network conflicts..."
    docker network prune -f

    # Attempt to create a test network
    log "Creating test network..."
    docker network create test_network || error "Failed to create test network"

    # Remove test network
    docker network rm test_network
}

# Main function
main() {
    log "${GREEN}Starting Docker Network Debugging...${NC}"
    debug_docker_networks
    log "${GREEN}Network debugging complete.${NC}"
}

# Execute main function
main
