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

echo -e "${YELLOW}🛠️  KijumbeSmart Management Script${NC}"
echo -e "${YELLOW}=================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root${NC}"
  exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose.${NC}"
    exit 1
fi

# Function to show help
show_help() {
    echo -e "\n${YELLOW}Usage: ${0} [command]${NC}"
    echo ""
    echo "Available commands:"
    echo "  start       - Start the application"
    echo "  stop        - Stop the application"
    echo "  restart     - Restart the application"
    echo "  status      - Show application status"
    echo "  logs        - Show application logs"
    echo "  backup      - Create a backup of the application data"
    echo "  update      - Update the application to the latest version"
    echo "  help        - Show this help message"
    echo ""
}

# Function to start the application
start_app() {
    echo -e "${YELLOW}🚀 Starting $APP_NAME...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ $APP_NAME started successfully!${NC}"
}

# Function to stop the application
stop_app() {
    echo -e "${YELLOW}🛑 Stopping $APP_NAME...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ $APP_NAME stopped successfully!${NC}"
}

# Function to restart the application
restart_app() {
    stop_app
    start_app
}

# Function to show application status
show_status() {
    echo -e "${YELLOW}📊 Application Status:${NC}"
    docker-compose ps
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}📝 Application Logs (Press Ctrl+C to exit):${NC}"
    docker-compose logs -f
}

# Function to create a backup
create_backup() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="/backups/$APP_NAME"
    BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
    
    echo -e "${YELLOW}💾 Creating backup...${NC}"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create backup
    docker-compose exec -T db pg_dump -U postgres $APP_NAME > "$BACKUP_DIR/backup_$TIMESTAMP.sql"
    
    # Compress backup
    tar -czf "$BACKUP_FILE" "$BACKUP_DIR/backup_$TIMESTAMP.sql"
    
    # Remove uncompressed backup
    rm "$BACKUP_DIR/backup_$TIMESTAMP.sql"
    
    echo -e "${GREEN}✅ Backup created successfully: $BACKUP_FILE${NC}"
}

# Function to update the application
update_app() {
    echo -e "${YELLOW}🔄 Updating $APP_NAME...${NC}"
    
    # Pull the latest changes
    git pull
    
    # Rebuild and restart the containers
    docker-compose build --no-cache
    docker-compose down
    docker-compose up -d
    
    echo -e "${GREEN}✅ $APP_NAME updated successfully!${NC}"
}

# Main script logic
case "$1" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
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
    update)
        update_app
        ;;
    help|--help|-h|*)
        show_help
        ;;
esac

exit 0
