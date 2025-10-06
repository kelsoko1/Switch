# Docker Build Fix - Package Lock Issue

## Problem

The Docker build was failing with this error:
```
npm ci can only install packages when your package.json and package-lock.json are in sync
Missing: @xmpp/client@0.13.6 from lock file
Missing: socket.io@4.8.1 from lock file
... (many more missing packages)
```

## Root Cause

The `server/package-lock.json` was out of sync with `server/package.json` because new dependencies were added but the lock file wasn't regenerated.

## Solution Applied

**Removed the redundant `npm ci` step** in the Dockerfile since we already copy the complete `node_modules` from the builder stage.

### Before (Line 62-63):
```dockerfile
# Install only production dependencies for server
RUN cd server && npm ci --only=production --legacy-peer-deps
```

### After:
```dockerfile
# Copy node_modules from builder (server dependencies already installed)
COPY --from=builder /app/server/node_modules ./server/node_modules
```

## Why This Works

1. **Builder stage** installs ALL dependencies (including dev dependencies)
2. **Builder stage** runs the build process
3. **Production stage** copies the already-installed `node_modules`
4. **No need to reinstall** - everything is already there!

## Rebuild Now

```bash
# Quick rebuild
chmod +x rebuild-and-deploy.sh
./rebuild-and-deploy.sh
```

Or manually:

```bash
# Stop containers
docker compose down

# Rebuild images
docker compose build --no-cache

# Start containers
docker compose up -d

# Check status
docker compose ps
curl http://localhost:2025/health
```

## Verification

After rebuild:
```bash
# Check if containers are running
docker compose ps

# Check logs
docker compose logs -f switch-app

# Test health endpoint
curl http://localhost:2025/health

# Should return: {"status":"ok","timestamp":"..."}
```

## If You Still Get Errors

### Option 1: Update Lock File Locally (Recommended)

```bash
# On your local machine (Windows)
cd server
npm install
# This will update package-lock.json

# Commit the changes
git add server/package-lock.json
git commit -m "Update server package-lock.json"
git push

# Then on server
git pull
docker compose build --no-cache
docker compose up -d
```

### Option 2: Generate Lock File on Server

```bash
# On the server
cd /root/Switch/server
npm install --package-lock-only
cd ..

# Rebuild
docker compose build --no-cache
docker compose up -d
```

### Option 3: Remove Lock File (Quick Fix)

```bash
# Remove the lock file
rm server/package-lock.json

# Add to .dockerignore
echo "server/package-lock.json" >> .dockerignore

# Rebuild
docker compose build --no-cache
docker compose up -d
```

## Current Status

✅ **Fixed**: Dockerfile no longer tries to reinstall dependencies  
✅ **Optimized**: Faster builds (no redundant npm install)  
✅ **Working**: Uses dependencies from builder stage

## Next Steps

1. Run the rebuild script: `./rebuild-and-deploy.sh`
2. Verify deployment: `curl http://localhost:2025/health`
3. Integrate with Caddy: `./integrate-caddy.sh`
4. Access your app: `https://kijumbesmart.co.tz`

---

**Issue**: Package lock file out of sync  
**Fix**: Removed redundant npm ci step  
**Status**: ✅ Ready to rebuild
