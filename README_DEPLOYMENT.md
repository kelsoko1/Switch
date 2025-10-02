# Switch App - Production Deployment Guide

Deploy the Switch app on **kijumbesmart.co.tz:2025** using Docker.

## 🚀 Quick Deploy from GitHub

### One-Command Deployment

```bash
# Clone and deploy
git clone https://github.com/yourusername/switch.git && \
cd switch && \
cp .env.example .env && \
nano .env && \
chmod +x deploy-docker.sh start-production.sh && \
sudo ./deploy-docker.sh
```

## 📋 Prerequisites

- **Server**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: 4GB minimum (8GB recommended)
- **CPU**: 2+ cores
- **Disk**: 20GB+ free space
- **Ports**: 2025, 80, 443 must be open
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

## 🔧 Step-by-Step Deployment

### 1. Install Docker (if not installed)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 2. Clone Repository

```bash
git clone https://github.com/yourusername/switch.git
cd switch
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

**Required Configuration:**

```env
# Appwrite (REQUIRED)
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_API_KEY=your_api_key

# Security (REQUIRED)
EJABBERD_ADMIN_PWD=your_secure_password

# Payment Gateway (OPTIONAL)
VITE_SELCOM_API_KEY=your_key
VITE_SELCOM_API_SECRET=your_secret
VITE_SELCOM_MERCHANT_ID=your_merchant_id
```

### 4. Deploy

```bash
# Make scripts executable
chmod +x deploy-docker.sh start-production.sh

# Run deployment
sudo ./deploy-docker.sh
```

### 5. Verify Deployment

```bash
# Check services
docker compose ps

# Check health
curl http://localhost:2025/health

# View logs
docker compose logs -f
```

## 🌐 Access Your Application

- **Local**: http://localhost:2025
- **Domain**: http://kijumbesmart.co.tz:2025
- **HTTPS**: https://kijumbesmart.co.tz:2025 (after SSL setup)

## 🔒 SSL/TLS Setup (Production)

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Stop nginx temporarily
docker compose stop nginx

# Get certificate
sudo certbot certonly --standalone -d kijumbesmart.co.tz

# Start nginx
docker compose start nginx

# Test renewal
sudo certbot renew --dry-run

# Auto-renewal (crontab)
sudo crontab -e
# Add: 0 0 * * * certbot renew --quiet && docker compose restart nginx
```

## 📦 Docker Commands

### Basic Operations

```bash
# Start services
docker compose up -d

# Stop services
docker compose stop

# Restart services
docker compose restart

# View logs
docker compose logs -f

# Stop and remove
docker compose down
```

### Using NPM Scripts

```bash
# Build images
npm run docker:build

# Start containers
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down

# Restart containers
npm run docker:restart

# Clean everything
npm run docker:clean
```

## 🔍 Troubleshooting

### Check Service Status

```bash
# All services
docker compose ps

# Specific service logs
docker compose logs switch-app
docker compose logs nginx
docker compose logs ejabberd
docker compose logs janus

# Follow logs in real-time
docker compose logs -f switch-app
```

### Common Issues

#### Port Already in Use

```bash
# Find process on port 2025
sudo lsof -i :2025

# Kill process
sudo kill -9 <PID>
```

#### Permission Denied

```bash
# Fix permissions
sudo chown -R $USER:$USER .
chmod +x *.sh
```

#### Build Failures

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker compose build --no-cache
```

#### Cannot Access Application

```bash
# Check firewall
sudo ufw status
sudo ufw allow 2025/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check if app is running
curl http://localhost:2025/health

# Check nginx config
docker compose exec nginx nginx -t
```

#### Container Keeps Restarting

```bash
# Check logs
docker compose logs switch-app

# Check environment variables
docker compose exec switch-app env | grep VITE

# Verify .env file
cat .env
```

## 🔄 Updates and Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Backup Data

```bash
# Create backup directory
mkdir -p backups

# Backup volumes
docker run --rm -v app-logs:/data -v $(pwd)/backups:/backup alpine tar czf /backup/app-logs.tar.gz /data
docker run --rm -v app-uploads:/data -v $(pwd)/backups:/backup alpine tar czf /backup/app-uploads.tar.gz /data
docker run --rm -v ejabberd-database:/data -v $(pwd)/backups:/backup alpine tar czf /backup/ejabberd-db.tar.gz /data

# Backup .env
cp .env backups/.env.backup
```

### Restore Data

```bash
# Restore volume
docker run --rm -v app-logs:/data -v $(pwd)/backups:/backup alpine tar xzf /backup/app-logs.tar.gz -C /
```

### Monitor Resources

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean unused resources
docker system prune
```

## 🏗️ Architecture

### Services

1. **switch-app** (172.20.0.10:2025)
   - Main Node.js application
   - Serves frontend and API
   - Handles WebSocket connections

2. **nginx** (172.20.0.5:80,443,2025)
   - Reverse proxy
   - SSL termination
   - Static file caching
   - Load balancing

3. **ejabberd** (172.20.0.20:5222,5280,5269)
   - XMPP server for real-time chat
   - User authentication
   - Message persistence

4. **janus** (172.20.0.30:8088,8188,8989)
   - WebRTC gateway
   - Video streaming
   - Screen sharing

### Network

- **Network**: switch-network (172.20.0.0/16)
- **Driver**: bridge
- **DNS**: Automatic service discovery

### Volumes

- `app-logs` - Application logs
- `app-uploads` - User uploads (videos, images)
- `ejabberd-conf` - XMPP configuration
- `ejabberd-database` - User data and messages
- `ejabberd-logs` - XMPP logs
- `janus-conf` - WebRTC configuration
- `nginx-ssl` - SSL certificates

## 🔐 Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Configure SSL/TLS certificates
- [ ] Enable firewall (ufw)
- [ ] Set up fail2ban (optional)
- [ ] Configure backup system
- [ ] Enable log rotation
- [ ] Set up monitoring
- [ ] Review nginx security headers
- [ ] Restrict SSH access
- [ ] Keep Docker updated

## 📊 Monitoring

### Health Checks

```bash
# Application health
curl http://localhost:2025/health

# Nginx status
docker compose exec nginx nginx -t

# Check all services
docker compose ps
```

### Logs

```bash
# All logs
docker compose logs

# Specific service
docker compose logs switch-app

# Follow logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100
```

### Resource Usage

```bash
# Real-time stats
docker stats

# Disk usage
docker system df

# Volume sizes
docker volume ls -q | xargs docker volume inspect | grep -A 5 Mountpoint
```

## 🆘 Support

### Documentation

- [Docker Deployment Guide](./DOCKER_DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [Appwrite Setup](./APPWRITE_SETUP.md) - Database configuration
- [XMPP Setup](./EJABBERD_SETUP.md) - Chat server configuration
- [WebRTC Setup](./JANUS_SETUP.md) - Streaming configuration

### Getting Help

- **GitHub Issues**: https://github.com/yourusername/switch/issues
- **Discussions**: https://github.com/yourusername/switch/discussions

## 📝 Environment Variables Reference

### Application

```env
NODE_ENV=production
PORT=2025
HOST=0.0.0.0
BASE_URL=https://kijumbesmart.co.tz
API_URL=https://kijumbesmart.co.tz/api
```

### Appwrite

```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_API_KEY=your_api_key
```

### Collections

```env
VITE_COLLECTION_USERS=users
VITE_COLLECTION_GROUPS=groups
VITE_COLLECTION_WALLETS=wallets
VITE_COLLECTION_TRANSACTIONS=transactions
VITE_COLLECTION_VIDEOS=videos
VITE_COLLECTION_SHORTS=shorts
VITE_COLLECTION_LIVE_STREAMS=live_streams
VITE_COLLECTION_STATUS_UPDATES=status_updates
```

### Storage Buckets

```env
VITE_BUCKET_VIDEOS=videos
VITE_BUCKET_THUMBNAILS=thumbnails
VITE_BUCKET_PROFILE_PICTURES=profile_pictures
VITE_BUCKET_STATUS_MEDIA=status_media
```

### XMPP (ejabberd)

```env
XMPP_DOMAIN=kijumbesmart.co.tz
XMPP_SERVER=wss://kijumbesmart.co.tz/xmpp-ws
EJABBERD_ADMIN=admin@kijumbesmart.co.tz
EJABBERD_ADMIN_PWD=your_secure_password
```

### Janus (WebRTC)

```env
USE_JANUS=true
JANUS_WS_URL=wss://kijumbesmart.co.tz/janus-ws
JANUS_HTTP_URL=https://kijumbesmart.co.tz/janus
```

### Payment Gateway (Optional)

```env
VITE_SELCOM_BASE_URL=https://apigw.selcommobile.com/v1
VITE_SELCOM_API_KEY=your_api_key
VITE_SELCOM_API_SECRET=your_api_secret
VITE_SELCOM_MERCHANT_ID=your_merchant_id
```

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] SSL certificates installed and working
- [ ] Firewall configured and enabled
- [ ] Backup system in place
- [ ] Monitoring configured
- [ ] Log rotation enabled
- [ ] Health checks passing
- [ ] Domain DNS configured
- [ ] Appwrite collections created
- [ ] Test all features (chat, streaming, payments)
- [ ] Load testing completed
- [ ] Security audit passed

## 📄 License

[Your License Here]

---

**Deployed on**: kijumbesmart.co.tz:2025  
**Last Updated**: 2025-10-01
