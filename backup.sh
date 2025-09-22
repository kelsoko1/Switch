#!/bin/bash

# This script creates a backup of the application
# Add to crontab to run daily at 2 AM:
# 0 2 * * * /root/switch/backup.sh

# Configuration
BACKUP_DIR="/var/backups/kijumbesmart"
APP_DIR="/root/switch"
RETENTION_DAYS=14
DATE=$(date +"%Y-%m-%d")
BACKUP_FILE="kijumbesmart-backup-$DATE.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Log file
LOG_FILE="$BACKUP_DIR/backup.log"

# Function to log messages
log_message() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

log_message "Starting backup process..."

# Create a backup of the application
tar -czf "$BACKUP_DIR/$BACKUP_FILE" -C "$(dirname $APP_DIR)" "$(basename $APP_DIR)" --exclude="node_modules" --exclude=".git" --exclude="dist"

# Check if backup was successful
if [ $? -eq 0 ]; then
  log_message "Backup created successfully: $BACKUP_FILE"
  
  # Calculate backup size
  BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
  log_message "Backup size: $BACKUP_SIZE"
else
  log_message "ERROR: Backup creation failed"
  exit 1
fi

# Remove backups older than retention period
find $BACKUP_DIR -name "kijumbesmart-backup-*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
log_message "Removed backups older than $RETENTION_DAYS days"

# Optional: Copy backup to remote server if rsync is available
if command -v rsync &> /dev/null && [ -n "$REMOTE_BACKUP_SERVER" ]; then
  log_message "Copying backup to remote server..."
  rsync -avz "$BACKUP_DIR/$BACKUP_FILE" $REMOTE_BACKUP_SERVER:$REMOTE_BACKUP_PATH/
  
  if [ $? -eq 0 ]; then
    log_message "Remote backup completed successfully"
  else
    log_message "ERROR: Remote backup failed"
  fi
fi

log_message "Backup process completed"
