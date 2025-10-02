# ✅ Updated Deployment Configuration

## Changes Made

### 1. **Automated Domain & Email Configuration**

Both deployment scripts now have the domain and email hardcoded at the top:

**setup-production.sh** and **deploy-docker.sh**:
```bash
# Configuration - Edit these values
DOMAIN="kijumbesmart.co.tz"
EMAIL="odamo360@gmail.com"
```

**No more interactive prompts!** The scripts will automatically use these values.

### 2. **Fixed .env.example**

Updated `.env.example` with correct URLs (no duplicate ports):

```env
# XMPP Configuration
XMPP_DOMAIN=kijumbesmart.co.tz
XMPP_SERVER=wss://kijumbesmart.co.tz/xmpp-ws
EJABBERD_WS_URL=wss://kijumbesmart.co.tz/xmpp-ws
EJABBERD_DOMAIN=kijumbesmart.co.tz
EJABBERD_API_URL=http://ejabberd:5280/api

# Janus WebRTC Configuration
JANUS_URL=wss://kijumbesmart.co.tz/janus-ws
JANUS_WS_URL=wss://kijumbesmart.co.tz/janus-ws
```

### 3. **Enhanced fix-env.sh Script**

The script now:
- Creates timestamped backups
- Fixes all URL variations
- Adds missing environment variables
- Provides detailed output
- Handles edge cases

## 🚀 Deployment Now

### Option 1: Fresh Deployment

```bash
# Clone repository
git clone https://github.com/yourusername/switch.git
cd switch

# Copy and configure environment
cp .env.example .env
nano .env  # Edit Appwrite credentials

# Run automated setup (no prompts!)
chmod +x setup-production.sh
sudo ./setup-production.sh
```

### Option 2: Fix Existing Deployment

If you already have the project but .env has wrong URLs:

```bash
# Fix the .env file
chmod +x fix-env.sh
./fix-env.sh

# Restart containers
docker compose down
docker compose up -d
```

### Option 3: Quick Deploy

```bash
git clone https://github.com/yourusername/switch.git
cd switch
cp .env.example .env
nano .env  # Edit Appwrite credentials
chmod +x fix-env.sh && ./fix-env.sh
docker compose up -d
```

## 📝 What to Edit in .env

Only these values need to be changed:

```env
# Appwrite (REQUIRED)
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
VITE_APPWRITE_API_KEY=your_api_key_here

# Security (REQUIRED)
EJABBERD_ADMIN_PWD=your_secure_password_here

# Payment (OPTIONAL)
VITE_SELCOM_API_KEY=your_key
VITE_SELCOM_API_SECRET=your_secret
VITE_SELCOM_MERCHANT_ID=your_merchant_id
```

**Everything else is pre-configured!**

## ✅ Verification

After deployment:

```bash
# Check services
docker compose ps

# Check health
curl http://localhost:2025/health

# View logs
docker compose logs -f

# Check specific service
docker compose logs switch-app
```

## 🌐 Access Points

- **HTTP**: http://kijumbesmart.co.tz:2025
- **HTTPS**: https://kijumbesmart.co.tz:2025
- **Health**: http://kijumbesmart.co.tz:2025/health

## 🔧 Troubleshooting

### If containers won't start:

```bash
# Check logs
docker compose logs switch-app

# Fix .env if needed
chmod +x fix-env.sh && ./fix-env.sh

# Rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

### If SSL fails:

```bash
# The script will show the manual command
# Or run directly:
sudo certbot certonly --standalone -d kijumbesmart.co.tz --email odamo360@gmail.com
```

## 📚 Files Updated

- ✅ `setup-production.sh` - Added DOMAIN and EMAIL variables
- ✅ `deploy-docker.sh` - Added DOMAIN and EMAIL variables
- ✅ `.env.example` - Fixed all URLs, added missing variables
- ✅ `fix-env.sh` - Enhanced with better error handling
- ✅ All scripts now work without user input

## 🎯 Summary

**Before**: Scripts asked for domain and email during setup  
**After**: Domain and email are pre-configured, zero prompts!

**Before**: .env.example had incorrect URLs with duplicate ports  
**After**: All URLs are correct and ready to use

**Before**: Manual fixing of .env required  
**After**: Automated fix-env.sh script handles everything

---

**Ready to deploy with ZERO manual input!** 🎉
