#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${YELLOW}[PORT RESOLVER]${NC} $1"
}

# Error handling function
error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to stop services using a specific port
stop_port_services() {
    local PORT=$1
    log "Checking for services using port ${PORT}..."

    # Stop system services
    local SERVICES=("nginx" "apache2" "httpd")
    for SERVICE in "${SERVICES[@]}"; do
        if systemctl is-active --quiet $SERVICE; then
            log "Stopping ${SERVICE} service..."
            sudo systemctl stop $SERVICE
            sudo systemctl disable $SERVICE
        fi
    done

    # Kill processes using the port
    local PIDS=$(sudo lsof -t -i:$PORT)
    if [ ! -z "$PIDS" ]; then
        log "${RED}Killing processes using port ${PORT}:${NC}"
        for PID in $PIDS; do
            PROCESS_NAME=$(ps -p $PID -o comm=)
            log "Killing process: ${PROCESS_NAME} (PID: ${PID})"
            sudo kill -9 $PID 2>/dev/null
        done
    fi

    # Stop Docker containers using the port
    local DOCKER_CONTAINERS=$(docker ps -q --filter "publish=${PORT}")
    if [ ! -z "$DOCKER_CONTAINERS" ]; then
        log "${RED}Stopping Docker containers using port ${PORT}:${NC}"
        docker stop $DOCKER_CONTAINERS
    fi
}

# Main function to resolve port conflicts
resolve_port_conflicts() {
    local PORTS=(80 443 8080 8443)

    log "${GREEN}Starting port conflict resolution...${NC}"

    for PORT in "${PORTS[@]}"; do
        stop_port_services $PORT
    done

    log "${GREEN}Port conflict resolution complete!${NC}"
}

# Verify script is run with sudo
if [[ $EUID -ne 0 ]]; then
   error "This script must be run with sudo" 
   exit 1
fi

# Execute main function
resolve_port_conflicts
