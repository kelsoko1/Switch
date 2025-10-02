# Switch App - Quick Start Guide

## 🚀 Deploy from GitHub in 5 Minutes

### One-Line Deployment

```bash
git clone https://github.com/yourusername/switch.git && cd switch && cp .env.example .env && nano .env && chmod +x setup-production.sh && sudo ./setup-production.sh
```

## 📦 What You Need

- **Server**: Ubuntu 20.04+ with 4GB RAM
- **Domain**: kijumbesmart.co.tz (or your domain)
- **Ports**: 2025, 80, 443 open
- **Appwrite Account**: Get API keys from [Appwrite](https://appwrite.io)

## 🔧 Step-by-Step

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/switch.git
cd switch
```

### 2. Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit configuration
nano .env
```

**Minimum Required:**

```env
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_API_KEY=your_api_key
EJABBERD_ADMIN_PWD=your_secure_password
```

### 3. Run Setup Script

```bash
chmod +x setup-production.sh
sudo ./setup-production.sh
```

The script will:
- ✅ Install Docker & Docker Compose
- ✅ Configure firewall
- ✅ Setup SSL (optional)
- ✅ Build and start all services
- ✅ Verify deployment

### 4. Access Your App

- **HTTP**: http://kijumbesmart.co.tz:2025
- **HTTPS**: https://kijumbesmart.co.tz:2025

## 🎯 Quick Commands

```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop services
docker compose stop

# Update app
git pull && docker compose up -d --build
```

## 📚 Full Documentation

- [Complete Deployment Guide](./README_DEPLOYMENT.md)
- [Docker Guide](./DOCKER_DEPLOYMENT_GUIDE.md)
- [Appwrite Setup](./APPWRITE_SETUP.md)
- [Troubleshooting](./DOCKER_DEPLOYMENT_GUIDE.md#troubleshooting)

## 🆘 Need Help?

- Check logs: `docker compose logs -f`
- Health check: `curl http://localhost:2025/health`
- GitHub Issues: [Report a problem](https://github.com/yourusername/switch/issues)

---

**Ready in 5 minutes!** 🎉
