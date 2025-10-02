# Switch App - Docker Deployment Guide

Complete guide for deploying the Switch app using Docker on **kijumbesmart.co.tz:2025**

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Configuration](#configuration)
5. [SSL/TLS Setup](#ssltls-setup)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+ (or any Linux with Docker support)
- **RAM**: Minimum 4GB (8GB recommended)
- **CPU**: 2+ cores
- **Disk**: 20GB+ free space
- **Network**: Port 2025, 80, 443 open

### Required Software

- Docker 20.10+
- Docker Compose 2.0+
- Git
- Curl

### Install Docker (Ubuntu/Debian)

```bash
# Update package index
sudo apt-get update

# Install dependencies
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

---

## Quick Start

### 1. Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/yourusername/switch.git
cd switch
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**

```env
# Appwrite Configuration
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_API_KEY=your_api_key

# Admin Password for ejabberd
EJABBERD_ADMIN_PWD=your_secure_password_here
```

### 3. Deploy

```bash
# Make deployment script executable
chmod +x deploy-docker.sh

# Run deployment
sudo ./deploy-docker.sh
```

### 4. Access the Application

- **HTTP**: http://kijumbesmart.co.tz:2025
- **HTTPS**: https://kijumbesmart.co.tz:2025 (after SSL setup)

---

## Detailed Setup

### Step 1: Server Preparation

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install required packages
sudo apt-get install -y git curl wget nano ufw

# Configure firewall
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 2025/tcp    # Application
sudo ufw enable
```

### Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/yourusername/switch.git
cd switch

# Create .env file from template
cp .env.example .env
```

### Step 3: Environment Configuration

Edit `.env` file with your configuration:

```bash
nano .env
```

**Complete Environment Variables:**

```env
# ============================================
# Application Configuration
# ============================================
NODE_ENV=production
PORT=2025
HOST=0.0.0.0
BASE_URL=https://kijumbesmart.co.tz
API_URL=https://kijumbesmart.co.tz/api

# ============================================
# Appwrite Configuration
# ============================================
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
VITE_APPWRITE_API_KEY=your_api_key_here

# ============================================
# XMPP Configuration (ejabberd)
# ============================================
XMPP_DOMAIN=kijumbesmart.co.tz
EJABBERD_ADMIN=admin@kijumbesmart.co.tz
EJABBERD_ADMIN_PWD=change_this_secure_password

# ============================================
# Payment Gateway (Optional - Selcom)
# ============================================
VITE_SELCOM_API_KEY=your_selcom_api_key
VITE_SELCOM_API_SECRET=your_selcom_api_secret
VITE_SELCOM_MERCHANT_ID=your_merchant_id
```

### Step 4: Build and Deploy

```bash
# Build Docker images
docker compose build

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

---

## Configuration

### Docker Compose Services

The deployment includes 4 services:

1. **switch-app** (Port 2025) - Main application
2. **nginx** (Ports 80, 443, 2025) - Reverse proxy
3. **ejabberd** (Ports 5222, 5280, 5269) - XMPP server for chat
4. **janus** (Ports 8088, 8188, 8989) - WebRTC gateway for streaming

### Service Management

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose stop

# Restart all services
docker compose restart

# Stop and remove containers
docker compose down

# View logs
docker compose logs -f [service_name]

# Execute command in container
docker compose exec switch-app sh
```

### Volume Management

Data is persisted in Docker volumes:

- `app-logs` - Application logs
- `app-uploads` - User uploads
- `ejabberd-conf` - XMPP configuration
- `ejabberd-database` - XMPP user database
- `ejabberd-logs` - XMPP logs
- `janus-conf` - Janus configuration
- `nginx-ssl` - SSL certificates

```bash
# List volumes
docker volume ls

# Backup volume
docker run --rm -v app-logs:/data -v $(pwd):/backup alpine tar czf /backup/app-logs-backup.tar.gz /data

# Restore volume
docker run --rm -v app-logs:/data -v $(pwd):/backup alpine tar xzf /backup/app-logs-backup.tar.gz -C /
```

---

## SSL/TLS Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Stop nginx container temporarily
docker compose stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d kijumbesmart.co.tz

# Start nginx container
docker compose start nginx

# Auto-renewal (add to crontab)
sudo crontab -e
# Add this line:
0 0 * * * certbot renew --quiet && docker compose restart nginx
```

### Option 2: Self-Signed Certificate (Development)

```bash
# Create SSL directory
sudo mkdir -p /etc/letsencrypt/live/kijumbesmart.co.tz

# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/letsencrypt/live/kijumbesmart.co.tz/privkey.pem \
  -out /etc/letsencrypt/live/kijumbesmart.co.tz/fullchain.pem \
  -subj "/CN=kijumbesmart.co.tz"

# Create chain file
sudo cp /etc/letsencrypt/live/kijumbesmart.co.tz/fullchain.pem \
  /etc/letsencrypt/live/kijumbesmart.co.tz/chain.pem

# Restart nginx
docker compose restart nginx
```

---

## Troubleshooting

### Check Service Health

```bash
# Check if services are running
docker compose ps

# Check application health
curl http://localhost:2025/health

# Check logs
docker compose logs -f switch-app
docker compose logs -f nginx
docker compose logs -f ejabberd
docker compose logs -f janus
```

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 2025
sudo lsof -i :2025

# Kill process
sudo kill -9 <PID>

# Or use different port in docker-compose.yml
```

#### 2. Permission Denied

```bash
# Fix permissions
sudo chown -R $USER:$USER .
sudo chmod +x deploy-docker.sh
```

#### 3. Build Failures

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker compose build --no-cache
```

#### 4. Container Keeps Restarting

```bash
# Check logs
docker compose logs switch-app

# Check environment variables
docker compose exec switch-app env

# Verify .env file
cat .env
```

#### 5. Cannot Connect to Application

```bash
# Check if port is accessible
curl http://localhost:2025/health

# Check firewall
sudo ufw status

# Check nginx configuration
docker compose exec nginx nginx -t
```

### Debug Mode

```bash
# Run container in debug mode
docker compose run --rm switch-app sh

# Check environment
env | grep VITE

# Test build
npm run build
```

---

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/switch-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup volumes
docker run --rm -v app-logs:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/app-logs.tar.gz /data
docker run --rm -v app-uploads:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/app-uploads.tar.gz /data
docker run --rm -v ejabberd-database:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/ejabberd-database.tar.gz /data

# Backup .env
cp .env $BACKUP_DIR/

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x backup.sh
./backup.sh
```

### Monitor Resources

```bash
# Monitor container resources
docker stats

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

### Logs Rotation

```bash
# Configure log rotation in docker-compose.yml (already configured)
# Logs are limited to 10MB per file, max 3 files

# Manual log cleanup
docker compose logs --tail=0 -f > /dev/null
```

---

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Backup system in place
- [ ] Monitoring configured
- [ ] Log rotation enabled
- [ ] Auto-restart on failure enabled
- [ ] Health checks working
- [ ] Domain DNS configured
- [ ] Appwrite collections created
- [ ] Payment gateway configured (if needed)

---

## Support

For issues and questions:

- GitHub Issues: https://github.com/yourusername/switch/issues
- Documentation: See other .md files in the repository
- Appwrite Setup: See APPWRITE_SETUP.md
- XMPP Setup: See EJABBERD_SETUP.md
- WebRTC Setup: See JANUS_SETUP.md

---

## License

[Your License Here]

---

**Last Updated**: 2025-10-01
