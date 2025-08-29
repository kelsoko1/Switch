#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to log messages
log() {
    echo -e "${YELLOW}[PORT RESOLVER]${NC} $1"
}

# Function to stop services using a specific port
stop_port_services() {
    local PORT=$1
    log "Checking for services using port ${PORT}..."

    # Find and stop processes
    local PIDS=$(sudo lsof -t -i:${PORT})
    
    if [ ! -z "$PIDS" ]; then
        log "${RED}Stopping processes using port ${PORT}:${NC}"
        for PID in $PIDS; do
            PROCESS_NAME=$(ps -p $PID -o comm=)
            log "Stopping process: ${PROCESS_NAME} (PID: ${PID})"
            sudo kill -9 $PID
        done
    else
        log "${GREEN}No processes found using port ${PORT}${NC}"
    fi

    # Stop Docker containers using the port
    local DOCKER_CONTAINERS=$(docker ps -q --filter "publish=${PORT}")
    
    if [ ! -z "$DOCKER_CONTAINERS" ]; then
        log "${RED}Stopping Docker containers using port ${PORT}:${NC}"
        docker stop $DOCKER_CONTAINERS
    fi
}

# Main function
main() {
    # Ports to check and resolve
    local PORTS=(80 443)

    for PORT in "${PORTS[@]}"; do
        stop_port_services $PORT
    done

    log "${GREEN}Port conflict resolution complete!${NC}"
}

# Execute main function
main
