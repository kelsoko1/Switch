#!/bin/bash

# This script monitors the application and restarts it if it's down
# Add this to crontab to run every 5 minutes:
# */5 * * * * /root/switch/monitor.sh >> /var/log/kijumbesmart-monitor.log 2>&1

# Log file
LOG_FILE="/var/log/kijumbesmart-monitor.log"

# Function to log messages
log_message() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Check if the application is running on port 2025
PORT_CHECK=$(netstat -tuln | grep 2025)
if [ -z "$PORT_CHECK" ]; then
  log_message "ERROR: Application is not running on port 2025. Attempting to restart..."
  
  # Try to restart using PM2
  pm2 restart kijumbesmart-app
  
  # Check if that worked
  sleep 10
  PORT_CHECK=$(netstat -tuln | grep 2025)
  if [ -z "$PORT_CHECK" ]; then
    log_message "PM2 restart failed. Attempting to restart the systemd service..."
    
    # Try to restart using systemd
    systemctl restart kijumbesmart.service
    
    # Check if that worked
    sleep 10
    PORT_CHECK=$(netstat -tuln | grep 2025)
    if [ -z "$PORT_CHECK" ]; then
      log_message "CRITICAL: Failed to restart the application. Manual intervention required."
      
      # Send an email alert if mail is configured
      if command -v mail &> /dev/null; then
        echo "KijumbeSmart application is down and could not be automatically restarted. Manual intervention required." | mail -s "CRITICAL: KijumbeSmart Application Down" admin@kijumbesmart.co.tz
      fi
    else
      log_message "Application successfully restarted using systemd."
    fi
  else
    log_message "Application successfully restarted using PM2."
  fi
else
  # Check if the API is responding
  API_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://kijumbesmart.co.tz/api/health)
  if [ "$API_CHECK" != "200" ]; then
    log_message "WARNING: API health endpoint returned status $API_CHECK. Attempting to restart..."
    
    # Try to restart using PM2
    pm2 restart kijumbesmart-app
    
    # Check if that worked
    sleep 10
    API_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://kijumbesmart.co.tz/api/health)
    if [ "$API_CHECK" != "200" ]; then
      log_message "API still not responding after restart. Manual intervention may be required."
    else
      log_message "API successfully restored after restart."
    fi
  fi
fi

# Check if Nginx is running
NGINX_CHECK=$(systemctl is-active nginx)
if [ "$NGINX_CHECK" != "active" ]; then
  log_message "ERROR: Nginx is not running. Attempting to restart..."
  
  # Try to restart Nginx
  systemctl restart nginx
  
  # Check if that worked
  sleep 5
  NGINX_CHECK=$(systemctl is-active nginx)
  if [ "$NGINX_CHECK" != "active" ]; then
    log_message "CRITICAL: Failed to restart Nginx. Manual intervention required."
  else
    log_message "Nginx successfully restarted."
  fi
fi
