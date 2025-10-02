#!/bin/bash

# ============================================
# Fix .env file port configurations
# ============================================

set -e

echo "🔧 Fixing .env file configurations..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating from .env.example..."
    cp .env.example .env
fi

# Backup original
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✓ Backup created"

# Fix XMPP URLs - Remove duplicate ports
sed -i 's|wss://kijumbesmart.co.tz:2025:2026/ws|wss://kijumbesmart.co.tz/xmpp-ws|g' .env
sed -i 's|wss://kijumbesmart.co.tz:2026/ws|wss://kijumbesmart.co.tz/xmpp-ws|g' .env
sed -i 's|XMPP_DOMAIN=kijumbesmart.co.tz:2025|XMPP_DOMAIN=kijumbesmart.co.tz|g' .env
sed -i 's|EJABBERD_DOMAIN=kijumbesmart.co.tz:2025|EJABBERD_DOMAIN=kijumbesmart.co.tz|g' .env
sed -i 's|https://kijumbesmart.co.tz:2025:2026/api|http://ejabberd:5280/api|g' .env
sed -i 's|https://kijumbesmart.co.tz:2026/api|http://ejabberd:5280/api|g' .env

# Fix Janus URLs - Remove duplicate ports
sed -i 's|wss://kijumbesmart.co.tz:2025:8188|wss://kijumbesmart.co.tz/janus-ws|g' .env
sed -i 's|wss://kijumbesmart.co.tz:8188|wss://kijumbesmart.co.tz/janus-ws|g' .env

# Ensure JANUS_URL is set
if ! grep -q "^JANUS_URL=" .env; then
    echo "JANUS_URL=wss://kijumbesmart.co.tz/janus-ws" >> .env
fi

# Ensure EJABBERD_WS_URL is set
if ! grep -q "^EJABBERD_WS_URL=" .env; then
    echo "EJABBERD_WS_URL=wss://kijumbesmart.co.tz/xmpp-ws" >> .env
fi

echo "✓ .env file fixed!"
echo ""
echo "📋 Updated URLs:"
echo "  ✓ XMPP_SERVER=wss://kijumbesmart.co.tz/xmpp-ws"
echo "  ✓ XMPP_DOMAIN=kijumbesmart.co.tz"
echo "  ✓ EJABBERD_DOMAIN=kijumbesmart.co.tz"
echo "  ✓ EJABBERD_API_URL=http://ejabberd:5280/api"
echo "  ✓ EJABBERD_WS_URL=wss://kijumbesmart.co.tz/xmpp-ws"
echo "  ✓ JANUS_URL=wss://kijumbesmart.co.tz/janus-ws"
echo "  ✓ JANUS_WS_URL=wss://kijumbesmart.co.tz/janus-ws"
echo ""
echo "🎉 Configuration fixed! You can now run:"
echo "   docker compose down && docker compose up -d"
