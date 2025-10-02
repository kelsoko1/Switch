#!/bin/bash

# ============================================
# Caddy Integration Helper Script
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Switch App - Caddy Integration${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠ This script should be run as root for Caddy reload${NC}"
    echo "Continue anyway? (y/N)"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 1: Check if Caddy is installed
echo -e "${BLUE}Step 1: Checking Caddy installation...${NC}"
if command -v caddy &> /dev/null; then
    echo -e "${GREEN}✓ Caddy is installed${NC}"
    caddy version
else
    echo -e "${YELLOW}✗ Caddy is not installed${NC}"
    echo "Please install Caddy first: https://caddyserver.com/docs/install"
    exit 1
fi

# Step 2: Check if Caddy is running
echo ""
echo -e "${BLUE}Step 2: Checking Caddy status...${NC}"
if systemctl is-active --quiet caddy; then
    echo -e "${GREEN}✓ Caddy is running${NC}"
else
    echo -e "${YELLOW}✗ Caddy is not running${NC}"
    echo "Start Caddy? (y/N)"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        systemctl start caddy
        echo -e "${GREEN}✓ Caddy started${NC}"
    else
        echo "Please start Caddy manually: sudo systemctl start caddy"
        exit 1
    fi
fi

# Step 3: Determine integration method
echo ""
echo -e "${BLUE}Step 3: Caddy integration method...${NC}"
echo "How do you want to integrate the Caddyfile?"
echo "1) Import into main Caddyfile (recommended)"
echo "2) Copy configuration to main Caddyfile"
echo "3) Use localhost instead of container names"
echo "4) Skip (I'll do it manually)"
read -p "Choose (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}Adding import to main Caddyfile...${NC}"
        MAIN_CADDYFILE="/etc/caddy/Caddyfile"
        IMPORT_LINE="import $(pwd)/Caddyfile"
        
        if grep -q "$IMPORT_LINE" "$MAIN_CADDYFILE" 2>/dev/null; then
            echo -e "${YELLOW}⚠ Import already exists in $MAIN_CADDYFILE${NC}"
        else
            echo "$IMPORT_LINE" >> "$MAIN_CADDYFILE"
            echo -e "${GREEN}✓ Added import to $MAIN_CADDYFILE${NC}"
        fi
        ;;
    2)
        echo ""
        echo -e "${BLUE}Copying configuration...${NC}"
        cat Caddyfile
        echo ""
        echo "Copy the above configuration to your main Caddyfile at /etc/caddy/Caddyfile"
        echo "Press Enter when done..."
        read
        ;;
    3)
        echo ""
        echo -e "${BLUE}Converting to localhost...${NC}"
        cp Caddyfile Caddyfile.backup
        sed -i 's/switch-app:2025/localhost:2025/g' Caddyfile
        sed -i 's/ejabberd:5280/localhost:5280/g' Caddyfile
        sed -i 's/janus:8188/localhost:8188/g' Caddyfile
        sed -i 's/janus:8088/localhost:8088/g' Caddyfile
        echo -e "${GREEN}✓ Caddyfile updated to use localhost${NC}"
        echo -e "${YELLOW}⚠ Backup saved as Caddyfile.backup${NC}"
        
        # Now add import
        MAIN_CADDYFILE="/etc/caddy/Caddyfile"
        IMPORT_LINE="import $(pwd)/Caddyfile"
        
        if grep -q "$IMPORT_LINE" "$MAIN_CADDYFILE" 2>/dev/null; then
            echo -e "${YELLOW}⚠ Import already exists in $MAIN_CADDYFILE${NC}"
        else
            echo "$IMPORT_LINE" >> "$MAIN_CADDYFILE"
            echo -e "${GREEN}✓ Added import to $MAIN_CADDYFILE${NC}"
        fi
        ;;
    4)
        echo -e "${YELLOW}Skipping automatic integration${NC}"
        echo "Remember to manually add the Caddyfile configuration!"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}Invalid choice${NC}"
        exit 1
        ;;
esac

# Step 4: Validate Caddy configuration
echo ""
echo -e "${BLUE}Step 4: Validating Caddy configuration...${NC}"
if caddy validate --config /etc/caddy/Caddyfile 2>/dev/null; then
    echo -e "${GREEN}✓ Caddy configuration is valid${NC}"
else
    echo -e "${YELLOW}✗ Caddy configuration has errors${NC}"
    echo "Please check the configuration manually"
    exit 1
fi

# Step 5: Reload Caddy
echo ""
echo -e "${BLUE}Step 5: Reloading Caddy...${NC}"
if systemctl reload caddy; then
    echo -e "${GREEN}✓ Caddy reloaded successfully${NC}"
else
    echo -e "${YELLOW}✗ Failed to reload Caddy${NC}"
    echo "Try manually: sudo systemctl reload caddy"
    exit 1
fi

# Step 6: Verify
echo ""
echo -e "${BLUE}Step 6: Verifying deployment...${NC}"
sleep 2

if curl -f -s http://localhost:2025/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ App is accessible locally${NC}"
else
    echo -e "${YELLOW}✗ App is not accessible locally${NC}"
    echo "Make sure Docker containers are running: docker compose ps"
fi

if curl -f -s https://kijumbesmart.co.tz/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ App is accessible via Caddy (HTTPS)${NC}"
else
    echo -e "${YELLOW}✗ App is not accessible via Caddy${NC}"
    echo "This is normal if SSL is still being provisioned"
    echo "Check Caddy logs: sudo journalctl -u caddy -f"
fi

# Success
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Caddy Integration Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Access your app:${NC}"
echo "  - HTTPS: https://kijumbesmart.co.tz"
echo "  - HTTP:  http://kijumbesmart.co.tz:2025"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  - Caddy status: sudo systemctl status caddy"
echo "  - Caddy logs:   sudo journalctl -u caddy -f"
echo "  - Reload Caddy: sudo systemctl reload caddy"
echo "  - App logs:     docker compose logs -f"
echo ""
