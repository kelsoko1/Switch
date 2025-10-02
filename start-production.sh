#!/bin/bash

# ============================================
# Switch App - Quick Start Script
# ============================================

set -e

echo "🚀 Starting Switch App..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration and run again"
    exit 1
fi

# Start with Docker Compose
echo "🐳 Starting Docker containers..."
docker compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo "🏥 Checking application health..."
if curl -f -s http://localhost:2025/health > /dev/null; then
    echo "✅ Application is healthy!"
    echo ""
    echo "🌐 Access your application at:"
    echo "   - Local:  http://localhost:2025"
    echo "   - Domain: http://kijumbesmart.co.tz:2025"
    echo ""
    echo "📊 View logs: docker compose logs -f"
    echo "🛑 Stop app:  docker compose stop"
else
    echo "❌ Application health check failed"
    echo "📋 Check logs: docker compose logs"
    exit 1
fi
