# Switch App - Caddy Integration Guide

## Overview

The Switch app is configured to work with your existing Caddy reverse proxy instead of using nginx. This allows it to coexist with other projects on your server.

## Configuration

### 1. Caddyfile Location

The `Caddyfile` in the project root contains the complete configuration for the Switch app.

### 2. Integration Steps

#### Option A: Include in Main Caddyfile

Add this to your main Caddyfile (usually `/etc/caddy/Caddyfile`):

```caddyfile
import /root/Switch/Caddyfile
```

#### Option B: Copy Configuration

Copy the contents of `Caddyfile` into your main Caddyfile at `/etc/caddy/Caddyfile`.

### 3. Docker Network Access

For Caddy to access the Docker containers, you need to connect Caddy to the Docker network:

```bash
# Find the network name
docker network ls | grep switch

# Connect Caddy to the network (if running Caddy in Docker)
docker network connect switch-network caddy

# OR if Caddy is on host, ensure containers are accessible
# The Caddyfile uses container names: switch-app, ejabberd, janus
```

### 4. Reload Caddy

After updating the configuration:

```bash
sudo systemctl reload caddy
# or
sudo caddy reload --config /etc/caddy/Caddyfile
```

## Services Configuration

The Caddyfile configures these services:

### Main Application (switch-app:2025)
- **Path**: `/` (root)
- **Features**: Frontend, API, WebSocket support
- **Container**: `switch-app`
- **Port**: 2025

### Socket.IO (/socket.io/*)
- **Path**: `/socket.io/*`
- **Features**: Real-time WebSocket connections
- **Container**: `switch-app`
- **Port**: 2025

### XMPP Chat (/xmpp-ws/*)
- **Path**: `/xmpp-ws/*`
- **Features**: ejabberd XMPP WebSocket
- **Container**: `ejabberd`
- **Port**: 5280

### Janus WebRTC
- **WebSocket**: `/janus-ws/*` → `janus:8188`
- **HTTP API**: `/janus/*` → `janus:8088`
- **Container**: `janus`

## Access Points

After deployment:

- **HTTPS (via Caddy)**: https://kijumbesmart.co.tz
- **Direct HTTP**: http://kijumbesmart.co.tz:2025
- **Health Check**: http://kijumbesmart.co.tz:2025/health

## SSL/TLS

Caddy handles SSL automatically using Let's Encrypt:

- **Email**: admin@kijumbesmart.co.tz (configured in Caddyfile)
- **Auto-renewal**: Handled by Caddy
- **Certificates**: Managed by Caddy automatically

## Troubleshooting

### 1. Caddy Can't Reach Containers

**Problem**: Caddy shows "dial tcp: lookup switch-app: no such host"

**Solution**: 

If Caddy is running on the host (not in Docker):
```bash
# Use localhost instead of container names
# Edit Caddyfile to use:
reverse_proxy localhost:2025
```

If Caddy is in Docker:
```bash
# Connect to the Docker network
docker network connect switch-network <caddy-container-name>
```

### 2. Port 80 Already in Use

**Problem**: Can't start Caddy because port 80 is in use

**Solution**: This is expected - your existing Caddy is already using it. Just reload the configuration:
```bash
sudo systemctl reload caddy
```

### 3. SSL Certificate Fails

**Problem**: Caddy can't obtain SSL certificate

**Solution**: 
- Ensure ports 80 and 443 are open
- Check DNS is pointing to your server
- Verify email in Caddyfile is correct
- Check Caddy logs: `sudo journalctl -u caddy -f`

### 4. WebSocket Connections Fail

**Problem**: Chat or streaming doesn't work

**Solution**: Ensure WebSocket headers are properly forwarded:
```caddyfile
header_up Connection {>Connection}
header_up Upgrade {>Upgrade}
```

## Verification

### Check Caddy Status
```bash
sudo systemctl status caddy
```

### Test Configuration
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

### View Caddy Logs
```bash
sudo journalctl -u caddy -f
```

### Test Endpoints
```bash
# Main app
curl https://kijumbesmart.co.tz

# Health check
curl http://localhost:2025/health

# Via Caddy
curl https://kijumbesmart.co.tz/health
```

## Docker Compose Changes

The `docker-compose.yml` has been updated:

- ✅ **Removed**: nginx service (using host Caddy instead)
- ✅ **Removed**: nginx-ssl volume
- ✅ **Removed**: Port 80/443 bindings
- ✅ **Kept**: Port 2025 for direct access
- ✅ **Kept**: All other services (switch-app, ejabberd, janus)

## Network Architecture

```
Internet
    ↓
Caddy (Host - Port 80/443)
    ↓
Docker Network (switch-network)
    ├── switch-app:2025 (Main app)
    ├── ejabberd:5280 (XMPP)
    └── janus:8088/8188 (WebRTC)
```

## Deployment Workflow

1. **Deploy Docker containers**:
   ```bash
   docker compose up -d
   ```

2. **Update Caddy configuration**:
   ```bash
   sudo nano /etc/caddy/Caddyfile
   # Add: import /root/Switch/Caddyfile
   ```

3. **Reload Caddy**:
   ```bash
   sudo systemctl reload caddy
   ```

4. **Verify**:
   ```bash
   curl https://kijumbesmart.co.tz/health
   ```

## Benefits of Using Caddy

- ✅ **Automatic HTTPS**: Let's Encrypt integration
- ✅ **Auto-renewal**: SSL certificates renewed automatically
- ✅ **Multiple Projects**: Share port 80/443 with other projects
- ✅ **Simple Configuration**: Clean, readable Caddyfile syntax
- ✅ **HTTP/2**: Enabled by default
- ✅ **WebSocket Support**: Built-in, no extra configuration

## Support

If you encounter issues:

1. Check Caddy logs: `sudo journalctl -u caddy -f`
2. Check Docker logs: `docker compose logs -f`
3. Verify network connectivity: `docker network inspect switch-network`
4. Test direct access: `curl http://localhost:2025/health`

---

**Last Updated**: 2025-10-02  
**Caddy Version**: 2.x  
**Docker Network**: switch-network
