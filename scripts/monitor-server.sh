#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="switch"
THRESHOLD_CPU=80
THRESHOLD_MEM=80
THRESHOLD_DISK=80

# Function to check if a service is running
check_service() {
  if systemctl is-active --quiet "$1"; then
    echo -e "${GREEN}✓${NC} $1 is running"
  else
    echo -e "${RED}✗${NC} $1 is not running"
  fi
}

# Function to check resource usage
check_resources() {
  echo -e "\n${YELLOW}📊 System Resources:${NC}"
  
  # CPU Usage
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}' | cut -d'.' -f1)
  echo -n "CPU Usage: $CPU_USAGE%"
  if [ "$CPU_USAGE" -gt "$THRESHOLD_CPU" ]; then
    echo -e " ${RED}(High)${NC}"
  else
    echo -e " ${GREEN}(Normal)${NC}"
  fi
  
  # Memory Usage
  MEM_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}' | cut -d'.' -f1)
  echo -n "Memory Usage: $MEM_USAGE%"
  if [ "$MEM_USAGE" -gt "$THRESHOLD_MEM" ]; then
    echo -e " ${RED}(High)${NC}"
  else
    echo -e " ${GREEN}(Normal)${NC}"
  fi
  
  # Disk Usage
  DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
  echo -n "Disk Usage: $DISK_USAGE%"
  if [ "$DISK_USAGE" -gt "$THRESHOLD_DISK" ]; then
    echo -e " ${RED}(High)${NC}"
  else
    echo -e " ${GREEN}(Normal)${NC}"
  fi
}

# Main function
main() {
  echo -e "${YELLOW}🔄 Checking system status...${NC}"
  
  # Check services
  check_service "$APP_NAME"
  check_service "nginx"
  
  # Check resources
  check_resources
  
  # Check for updates
  echo -e "\n${YELLOW}🔄 Checking for system updates...${NC}"
  UPDATES_AVAILABLE=$(apt list --upgradable 2>/dev/null | wc -l)
  if [ "$UPDATES_AVAILABLE" -gt 1 ]; then
    echo -e "${YELLOW}⚠️  $((UPDATES_AVAILABLE-1)) updates available. Run 'apt update && apt upgrade' to update.${NC}"
  else
    echo -e "${GREEN}✓ System is up to date${NC}"
  fi
  
  # Check certificate expiration
  if [ -d "/etc/letsencrypt/live" ]; then
    echo -e "\n${YELLOW}🔒 SSL Certificate Status:${NC}"
    certbot certificates | grep -E "Certificate Name|Expiry"
  fi
  
  echo -e "\n${GREEN}✅ System check completed${NC}"
}

# Run main function
main
