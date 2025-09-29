#!/bin/bash

# Exit on error
set -e

# Configuration
BACKUP_DIR="/var/backups/kijumbesmart"
RESTORE_DIR="/tmp/kijumbesmart_restore_$(date +%s)"
LOG_FILE="/var/log/kijumbesmart/restore_$(date +'%Y%m%d_%H%M%S').log"

# Create restore directory
mkdir -p "${RESTORE_DIR}"
mkdir -p "$(dirname "${LOG_FILE}")"

# Log function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Check if backup file is provided
if [ $# -eq 0 ]; then
    log "Error: No backup file specified"
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

BACKUP_FILE="$1"

# Verify backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    log "Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Start restore
log "Starting KijumbeSmart restore process..."
log "Backup file: ${BACKUP_FILE}"

# Extract backup
log "Extracting backup file..."
tar -xzf "${BACKUP_FILE}" -C "${RESTORE_DIR}"

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
