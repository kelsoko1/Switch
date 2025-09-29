#!/bin/bash

# Deployment script for Switch application on Ubuntu
# Run with: bash deploy-ubuntu.sh

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="switch"
APP_PORT=2025
XMPP_PORT=2026
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
BACKUP_DIR="/var/backups/${APP_NAME}"
LOG_FILE="/var/log/${APP_NAME}/deploy.log"

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log messages
log() {
    local message="$(date '+%Y-%m-%d %H:%M:%S') - $1"
    echo -e "${YELLOW}${message}${NC}"
    echo "$message" >> "$LOG_FILE"
}

# Function to execute commands with error handling
execute() {
    local cmd="$*"
    log "Executing: $cmd"
    if ! output=$($cmd 2>&1); then
        log "${RED}Error executing: $cmd\n$output${NC}"
        exit 1
    fi
    echo "$output"
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    log "${RED}This script must be run as root${NC}"
    exit 1
fi

# Check for required dependencies
check_dependencies() {
    local missing=()
    for dep in docker docker-compose curl jq; do
        if ! command -v $dep &> /dev/null; then
            missing+=("$dep")
        fi
    done

    if [ ${#missing[@]} -ne 0 ]; then
        log "${RED}Missing dependencies: ${missing[*]}${NC}"
        log "Installing required dependencies..."
        apt-get update
        apt-get install -y apt-transport-https ca-certificates curl software-properties-common jq
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
        add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
}

# Backup existing data
backup_data() {
    log "Creating backup of current data..."
    local timestamp=$(date +%Y%m%d%H%M%S)
    local backup_path="${BACKUP_DIR}/${timestamp}"
    
    mkdir -p "$backup_path"
    
    # Backup volumes
    if docker volume ls | grep -q ${APP_NAME}_; then
        for volume in $(docker volume ls --format '{{.Name}}' | grep ${APP_NAME}_); do
            log "Backing up volume: $volume"
            docker run --rm -v "$volume":/source -v "$backup_path":/backup alpine \
                sh -c "cd /source && tar czf /backup/${volume}.tar.gz ."
        done
    fi
    
    # Backup environment file if exists
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "${backup_path}/"
    fi
    
    log "Backup created at: $backup_path"
}

# Deploy application
deploy() {
    log "Starting deployment of ${APP_NAME}..."
    
    # Pull latest images
    log "Pulling latest Docker images..."
    execute docker-compose -f "$DOCKER_COMPOSE_FILE" pull
    
    # Stop and remove existing containers
    log "Stopping and removing existing containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down || true
    
    # Start services
    log "Starting services..."
    execute docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --build --force-recreate
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    max_retries=30
    retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if docker ps --filter "name=${APP_NAME}" --filter "health=healthy" | grep -q ${APP_NAME}; then
            log "${GREEN}Application is healthy and running!${NC}"
            break
        fi
        
        retry_count=$((retry_count + 1))
        log "Waiting for services to be healthy (attempt $retry_count/$max_retries)..."
        sleep 10
    done
    
    if [ $retry_count -eq $max_retries ]; then
        log "${RED}Timed out waiting for services to be healthy${NC}"
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs
        exit 1
    fi
    
    log "${GREEN}Deployment completed successfully!${NC}"
    log "Application URL: http://localhost:${APP_PORT}"
}

# Main execution
main() {
    log "=== Starting ${APP_NAME} Deployment ==="
    check_dependencies
    backup_data
    deploy
    
    # Show container status
    log "\nContainer status:"
    docker ps --filter "name=${APP_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    log "\nDeployment log: $LOG_FILE"
    log "To view logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
    log "To stop the application: docker-compose -f $DOCKER_COMPOSE_FILE down"
    log "${GREEN}=== Deployment completed ===${NC}"
}

# Execute main function
main "$@" 2>&1 | tee -a "$LOG_FILE"
