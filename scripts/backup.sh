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
BACKUP_DIR="/var/backups/$APP_NAME"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${APP_NAME}_backup_${TIMESTAMP}.tar.gz"
LOG_FILE="/var/log/${APP_NAME}/backup_${TIMESTAMP}.log"
APP_DIR="/opt/$APP_NAME"
KEEP_BACKUPS=7  # Number of backups to keep

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"
mkdir -p "$(dirname "${LOG_FILE}")"

# Log function
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Start backup
log "${YELLOW}🚀 Starting $APP_NAME backup process...${NC}"

# Create a temporary directory for the backup
TEMP_DIR=$(mktemp -d)
log "${YELLOW}📂 Using temporary directory: $TEMP_DIR${NC}"

# Backup function
try_backup() {
    local service=$1
    local cmd=$2
    local file=$3
    local target_file="${TEMP_DIR}/${file}"
    
    log "${YELLOW}📦 Backing up ${service}...${NC}"
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "$target_file")"
    
    if eval "$cmd" > "$target_file" 2>> "${LOG_FILE}"; then
        log "${GREEN}✓ Successfully backed up ${service} to ${file}${NC}"
        return 0
    else
        log "${RED}✗ Failed to back up ${service}${NC}"
        return 1
    fi
    
    log "Backing up ${service}..."
    if docker compose exec -T ${service} ${cmd} > "${TEMP_DIR}/${file}"; then
        log "Successfully backed up ${service}"
    else
        log "Warning: Failed to back up ${service}"
        rm -f "${TEMP_DIR}/${file}" 2>/dev/null || true
    fi
}

# Backup application data
backup_application_data() {
    log "${YELLOW}📂 Backing up application data...${NC}"
    
    # Create a directory for application data
    mkdir -p "${TEMP_DIR}/app_data"
    
    # Copy important application files
    local app_files=(
        "${APP_DIR}/.env"
        "${APP_DIR}/server/.env"
        "${APP_DIR}/config"
        "/etc/nginx/sites-available/${APP_NAME}"
        "/etc/systemd/system/${APP_NAME}.service"
    )
    
    for file in "${app_files[@]}"; do
        if [ -e "$file" ]; then
            cp -r "$file" "${TEMP_DIR}/app_data/"
            log "${GREEN}✓ Backed up ${file}${NC}"
        else
            log "${YELLOW}⚠️  File not found: ${file}${NC}"
        fi
    done
}

# Backup database
try_backup "database" "pg_dump -U postgres ${APP_NAME}" "database/dump.sql"

# Backup Redis data (if used)
if systemctl is-active --quiet redis; then
    try_backup "redis" "redis-cli SAVE && cp /var/lib/redis/dump.rdb /tmp/redis_dump.rdb && cat /tmp/redis_dump.rdb" "redis/dump.rdb"
fi
try_backup "redis" "redis-cli SAVE" "redis_dump.rdb"

# Backup uploaded files
log "Backing up uploaded files..."
if [ -d "uploads" ]; then
    cp -r uploads "${TEMP_DIR}/"
    log "Successfully backed up uploaded files"
else
    log "Warning: Uploads directory not found, skipping"
fi

# Backup configuration files
log "Backing up configuration files..."
cp -r nginx "${TEMP_DIR}/"
cp .env "${TEMP_DIR}/"
cp docker-compose.yml "${TEMP_DIR}/"
log "Configuration files backed up"

# Backup application data
backup_application_data

# Create the final backup archive
log "${YELLOW}📦 Creating backup archive...${NC}"
if tar -czf "${BACKUP_FILE}" -C "${TEMP_DIR}" .; then
    log "${GREEN}✓ Backup archive created: ${BACKUP_FILE}${NC}"
    
    # Set proper permissions
    chmod 600 "${BACKUP_FILE}"
    chown "${APP_USER}:${APP_USER}" "${BACKUP_FILE}"
    
    # Clean up old backups
    log "${YELLOW}🧹 Cleaning up old backups...${NC}"
    find "${BACKUP_DIR}" -name "${APP_NAME}_backup_*.tar.gz" -type f -mtime +${KEEP_BACKUPS} -delete -print | while read -r file; do
        log "${YELLOW}  Removed old backup: ${file}${NC}"
    done
    
    # Clean up temporary directory
    rm -rf "${TEMP_DIR}"
    
    log "${GREEN}✅ Backup completed successfully!${NC}"
    log "${GREEN}📁 Backup location: ${BACKUP_FILE}${NC}"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log "${GREEN}💾 Backup size: ${BACKUP_SIZE}${NC}"
    
    exit 0
else
    log "${RED}❌ Failed to create backup archive${NC}"
    # Clean up temporary directory on failure
    rm -rf "${TEMP_DIR}"
    exit 1
fi
