#!/bin/bash

# Application management script for Switch
# Run with: sudo bash manage-app.sh [start|stop|restart|status|logs|backup]

set -e

# Configuration
APP_NAME="switch"
DOCKER_COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="/var/backups/${APP_NAME}"
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo -e "${RED}This script must be run as root${NC}"
    exit 1
fi

# Functions
start_services() {
    echo -e "${YELLOW}Starting ${APP_NAME} services...${NC}"
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    echo -e "${GREEN}Services started successfully${NC}"
}

stop_services() {
    echo -e "${YELLOW}Stopping ${APP_NAME} services...${NC}"
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    echo -e "${GREEN}Services stopped successfully${NC}"
}

restart_services() {
    stop_services
    start_services
}

show_status() {
    echo -e "${YELLOW}=== Container Status ===${NC}"
    docker ps --filter "name=${APP_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\\t{{.RunningFor}}"
    
    echo -e "\n${YELLOW}=== Resource Usage ===${NC}"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | head -n 1
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | grep "${APP_NAME}"
}

show_logs() {
    echo -e "${YELLOW}Showing logs (Ctrl+C to exit)...${NC}"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f
}

create_backup() {
    echo -e "${YELLOW}Creating backup...${NC}"
    local backup_path="${BACKUP_DIR}/${TIMESTAMP}"
    
    mkdir -p "$backup_path"
    
    # Backup volumes
    if docker volume ls | grep -q ${APP_NAME}_; then
        for volume in $(docker volume ls --format '{{.Name}}' | grep ${APP_NAME}_); do
            echo "Backing up volume: $volume"
            docker run --rm -v "$volume":/source -v "$backup_path":/backup alpine \
                sh -c "cd /source && tar czf /backup/${volume}.tar.gz ."
        done
    fi
    
    # Backup environment file
    if [ -f ".env" ]; then
        cp ".env" "${backup_path}/"
    fi
    
    echo -e "${GREEN}Backup created at: $backup_path${NC}"
}

show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start all services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  status    Show container status and resource usage"
    echo "  logs      Follow container logs"
    echo "  backup    Create a backup of application data"
    echo "  help      Show this help message"
}

# Main script
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    backup)
        create_backup
        ;;
    *)
        show_help
        exit 1
        ;;
esac

exit 0
