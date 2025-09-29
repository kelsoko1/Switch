#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="switch"
DEFAULT_BACKUP_DIR="/var/backups/$APP_NAME"
RESTORE_DIR="/tmp/${APP_NAME}_restore_$(date +%s)"
LOG_FILE="/var/log/${APP_NAME}/restore_$(date +'%Y%m%d_%H%M%S').log"
APP_DIR="/opt/$APP_NAME"

# Create restore directory
mkdir -p "${RESTORE_DIR}"
mkdir -p "$(dirname "${LOG_FILE}")"

# Log function
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Show usage
show_usage() {
    echo -e "${YELLOW}Usage: $0 [OPTIONS] <backup_file>${NC}"
    echo -e "${YELLOW}Options:${NC}"
    echo -e "  -h, --help      Show this help message"
    echo -e "  -l, --list      List available backups in $DEFAULT_BACKUP_DIR"
    echo -e "  -f, --force     Force restore without confirmation"
    echo -e "\n${YELLOW}Examples:${NC}"
    echo -e "  $0 /path/to/backup.tar.gz"
    echo -e "  $0 --list"
    echo -e "  $0 --force ${DEFAULT_BACKUP_DIR}/${APP_NAME}_backup_20230101_120000.tar.gz"
    exit 1
}

# List available backups
list_backups() {
    if [ -d "$DEFAULT_BACKUP_DIR" ]; then
        echo -e "${YELLOW}Available backups in $DEFAULT_BACKUP_DIR:${NC}"
        find "$DEFAULT_BACKUP_DIR" -name "${APP_NAME}_backup_*.tar.gz" -type f -printf "%T@ %p\n" | sort -n | cut -d' ' -f2- | while read -r file; do
            size=$(du -h "$file" | cut -f1)
            date=$(stat -c "%y" "$file")
            echo -e "${GREEN}$(basename "$file")${NC} (${size}, ${date})"
        done
    else
        log "${RED}Backup directory not found: $DEFAULT_BACKUP_DIR${NC}"
    fi
    exit 0
}

# Parse command line arguments
FORCE=0
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            ;;
        -l|--list)
            list_backups
            ;;
        -f|--force)
            FORCE=1
            shift
            ;;
        *)
            BACKUP_FILE="$1"
            shift
            ;;
    esac
done

# If no backup file specified and not listing, show usage
if [ -z "$BACKUP_FILE" ]; then
    show_usage
fi

# Verify backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    log "${RED}Error: Backup file not found: ${BACKUP_FILE}${NC}"
    # Check if it exists in the default backup directory
    if [ -f "${DEFAULT_BACKUP_DIR}/${BACKUP_FILE}" ]; then
        BACKUP_FILE="${DEFAULT_BACKUP_DIR}/${BACKUP_FILE}"
        log "${YELLOW}Found backup in default directory: ${BACKUP_FILE}${NC}"
    else
        log "${RED}Backup file not found in the default directory either.${NC}"
        log "${YELLOW}Use '$0 --list' to see available backups.${NC}"
        exit 1
    fi
    exit 1
fi

# Start restore
log "Starting KijumbeSmart restore process..."
log "Backup file: ${BACKUP_FILE}"

# Get backup file info
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
BACKUP_DATE=$(stat -c "%y" "${BACKUP_FILE}")

# Show restore confirmation
if [ "$FORCE" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: This will restore data from backup:${NC}"
    echo -e "   Backup file: ${GREEN}$(basename "$BACKUP_FILE")${NC}"
    echo -e "   Size: $BACKUP_SIZE"
    echo -e "   Last modified: $BACKUP_DATE"
    echo -e "   This will overwrite existing data in ${RED}${APP_DIR}${NC}"
    read -p "Are you sure you want to continue? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "${YELLOW}Restore cancelled by user${NC}"
        exit 0
    fi
fi

# Stop services if running
log "${YELLOW}🛑 Stopping services...${NC}"
if systemctl is-active --quiet "${APP_NAME}"; then
    systemctl stop "${APP_NAME}"
fi

# Extract backup file
log "${YELLOW}📦 Extracting backup file...${NC}"
if ! tar -xzf "${BACKUP_FILE}" -C "${RESTORE_DIR}" 2>> "${LOG_FILE}"; then
    log "${RED}❌ Failed to extract backup file${NC}"
    exit 1
fi

# Verify backup contents
required_files=("db_dump.sql" ".env" "docker-compose.yml")
for file in "${required_files[@]}"; do
    if [ ! -f "${RESTORE_DIR}/${file}" ]; then
        log "Warning: Required file not found in backup: ${file}"
    fi
done

# Stop services
log "Stopping services..."
docker compose down || true

# Restore database
if [ -f "${RESTORE_DIR}/db_dump.sql" ]; then
    log "Restoring database..."
    docker compose up -d db
    sleep 10  # Wait for database to start
    
    # Drop and recreate database
    docker compose exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS kijumbesmart"
    docker compose exec -T db createdb -U postgres kijumbesmart
    
    # Restore database
    cat "${RESTORE_DIR}/db_dump.sql" | docker compose exec -T db psql -U postgres kijumbesmart
    log "Database restored successfully"
else
    log "No database dump found, skipping database restore"
fi

# Restore Redis (if used)
if [ -f "${RESTORE_DIR}/redis_dump.rdb" ]; then
    log "Restoring Redis data..."
    docker compose up -d redis
    sleep 5  # Wait for Redis to start
    
    # Stop Redis to restore data
    docker compose stop redis
    
    # Copy the RDB file
    docker cp "${RESTORE_DIR}/redis_dump.rdb" "$(docker compose ps -q redis):/data/dump.rdb"
    
    # Fix permissions
    docker compose exec -T redis chown redis:redis /data/dump.rdb
    
    # Start Redis
    docker compose start redis
    log "Redis data restored successfully"
fi

# Restore uploaded files
if [ -d "${RESTORE_DIR}/uploads" ]; then
    log "Restoring uploaded files..."
    mkdir -p uploads
    rsync -a "${RESTORE_DIR}/uploads/" "uploads/"
    chown -R 1000:1000 uploads  # Adjust user/group as needed
    log "Uploaded files restored successfully"
fi

# Restore configuration files
log "Restoring configuration files..."
if [ -d "${RESTORE_DIR}/nginx" ]; then
    cp -r "${RESTORE_DIR}/nginx" ./
fi
if [ -f "${RESTORE_DIR}/.env" ]; then
    cp "${RESTORE_DIR}/.env" ./
fi
if [ -f "${RESTORE_DIR}/docker-compose.yml" ]; then
    cp "${RESTORE_DIR}/docker-compose.yml" ./
fi
log "Configuration files restored"

# Start services
log "Starting services..."
docker compose up -d

# Clean up
log "Cleaning up..."
rm -rf "${RESTORE_DIR}"

# Verify services are running
log "Verifying services..."
docker compose ps

log "Restore completed successfully!"
log "Restore log: ${LOG_FILE}"
exit 0
