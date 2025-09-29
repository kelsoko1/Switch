#!/bin/bash

# Exit on error
set -e

# Configuration
BACKUP_DIR="/var/backups/kijumbesmart"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/kijumbesmart_backup_${TIMESTAMP}.tar.gz"
LOG_FILE="/var/log/kijumbesmart/backup_${TIMESTAMP}.log"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"
mkdir -p "$(dirname "${LOG_FILE}")"

# Log function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Start backup
log "Starting KijumbeSmart backup process..."

# Create a temporary directory for the backup
TEMP_DIR=$(mktemp -d)

# Backup database
try_backup() {
    local service=$1
    local cmd=$2
    local file=$3
    
    log "Backing up ${service}..."
    if docker compose exec -T ${service} ${cmd} > "${TEMP_DIR}/${file}"; then
        log "Successfully backed up ${service}"
    else
        log "Warning: Failed to back up ${service}"
        rm -f "${TEMP_DIR}/${file}" 2>/dev/null || true
    fi
}

# Backup PostgreSQL database (if used)
try_backup "db" "pg_dump -U postgres kijumbesmart" "db_dump.sql"

# Backup Redis data (if used)
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

# Create the final backup archive
log "Creating backup archive..."
tar -czf "${BACKUP_FILE}" -C "${TEMP_DIR}" .

# Clean up temporary files
rm -rf "${TEMP_DIR}"

# Set permissions
chmod 600 "${BACKUP_FILE}"
chown root:root "${BACKUP_FILE}"

# Log completion
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log "Backup completed successfully!"
log "Backup file: ${BACKUP_FILE}"
log "Backup size: ${BACKUP_SIZE}"

# Rotate backups (keep last 7 days)
log "Rotating old backups..."
find "${BACKUP_DIR}" -name "kijumbesmart_backup_*.tar.gz" -mtime +7 -delete

# Log completion
log "Backup process completed successfully!"
exit 0
