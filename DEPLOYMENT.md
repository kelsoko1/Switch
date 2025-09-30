# Switch Application Deployment Guide

This guide provides instructions for deploying the Switch application using Docker and Docker Compose with the following port configuration:

## Port Configuration

| Port | Protocol | Service | Description |
|------|----------|---------|-------------|
| 2025 | TCP      | App     | Main application frontend |
| 2026 | TCP      | API     | Application API |
| 2027 | TCP      | XMPP    | XMPP WebSocket |
| 2028 | TCP      | Janus   | Janus WebSocket |
| 2029 | TCP      | Janus   | Janus HTTP API |

## Prerequisites

- Docker and Docker Compose installed
- Ports 2025-2029 available on your server
- Domain name (kijumbesmart.co.tz) pointing to your server's IP address
- Existing Caddy reverse proxy (already configured on your server)
- Required ports open in your firewall (see table above)

## Caddy Configuration

The Caddy reverse proxy is used to handle all incoming traffic and route it to the appropriate services. The configuration is stored in `Caddyfile`.

Key features:
- Automatic HTTPS with Let's Encrypt
- WebSocket support for real-time features
- Rate limiting to prevent abuse
- Header management for security

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/switch.git
cd switch
```

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables in `.env`:
   ```bash
   nano .env
   ```

3. Ensure the following variables are set correctly:
   ```
   # Server Configuration
   PORT=2025
   HOST=0.0.0.0
   FRONTEND_URL=https://kijumbesmart.co.tz:2025
   VITE_BASE_URL=https://kijumbesmart.co.tz:2025
   
   # XMPP Configuration
   XMPP_SERVER=wss://kijumbesmart.co.tz:2026/ws
   XMPP_DOMAIN=kijumbesmart.co.tz
   EJABBERD_WS_URL=wss://kijumbesmart.co.tz:2026/ws
   EJABBERD_DOMAIN=kijumbesmart.co.tz
   EJABBERD_API_URL=https://kijumbesmart.co.tz:2026/api
   
   # Janus Configuration
   USE_JANUS=true
   JANUS_WS_URL=wss://kijumbesmart.co.tz:8188
   JANUS_JS_URL=https://kijumbesmart.co.tz:8088/janus.js
   JANUS_HTTP_URL=https://kijumbesmart.co.tz:8088/janus
   ```

### 3. Deploy the Application

1. Make the deployment script executable:
   ```bash
   chmod +x deploy.sh
   ```

2. Run the deployment script as root:
   ```bash
   sudo ./deploy.sh
   ```

   This will:
   - Set up the application in `/root/Switch`
   - Install and enable a systemd service for automatic startup
   - Start the application as a background service
   - Configure the service to restart automatically if it fails
   - Create a Caddy configuration snippet

3. Configure Caddy:
   - The deployment script will create a file at `/root/Switch/caddy-snippet.conf`
   - Add this configuration to your main Caddyfile
   - Reload Caddy to apply the changes:
     ```bash
     sudo systemctl reload caddy
     ```

4. Verify the service is running:
   ```bash
   systemctl status switch-app
   ```
   
5. Check Caddy logs for any issues:
   ```bash
   journalctl -u caddy -f
   ```

The deployment script will:
1. Check if all required ports are available
2. Configure the firewall to allow the required ports
3. Pull the latest changes from the repository
4. Build the Docker images
5. Create necessary Docker networks and volumes
6. Start all containers with the correct port mappings
7. Set up proper logging and monitoring

### 4. Verify the Deployment

After deployment, verify that all services are running:

1. Check container status:
   ```bash
   docker-compose ps
   ```

2. Check application logs:
   ```bash
   docker-compose logs -f
   ```

3. Verify services are accessible:
   - Main application: https://kijumbesmart.co.tz:2025
   - XMPP WebSocket: wss://kijumbesmart.co.tz:2026/ws
   - Janus WebRTC: https://kijumbesmart.co.tz:8088/janus

## Application Management

The application runs as a systemd service for persistent operation. Use these commands to manage it:

### Service Management

- **Start the service**:
  ```bash
  systemctl start switch-app
  ```

- **Stop the service**:
  ```bash
  systemctl stop switch-app
  ```

- **Restart the service**:
  ```bash
  systemctl restart switch-app
  ```

- **View service status**:
  ```bash
  systemctl status switch-app
  ```

### Logs
./manage.sh backup

# Update the application
./manage.sh update
```

## Port Configuration

The following ports are used by the application:

- `80`: HTTP (redirects to HTTPS)
- `443`: HTTPS (main application)
- `2026`: XMPP server (WebSocket)
- `8088`: Janus WebRTC (HTTP)
- `8188`: Janus WebRTC (WebSocket)

## Environment Variables

Key environment variables that need to be configured:

```
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=your_appwrite_endpoint
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_API_KEY=your_api_key

# Payment Gateway (Selcom)
VITE_SELCOM_BASE_URL=https://apigw.selcommobile.com/v1
VITE_SELCOM_API_KEY=your_selcom_api_key
VITE_SELCOM_API_SECRET=your_selcom_secret
VITE_SELCOM_MERCHANT_ID=your_merchant_id

# XMPP/Janus Configuration
XMPP_SERVER=wss://kijumbesmart.co.tz:2025:2026/ws
XMPP_DOMAIN=kijumbesmart.co.tz:2025
EJABBERD_WS_URL=wss://kijumbesmart.co.tz:2025:2026/ws
EJABBERD_DOMAIN=kijumbesmart.co.tz:2025
EJABBERD_API_URL=https://kijumbesmart.co.tz:2025:2026/api
USE_JANUS=true
JANUS_URL=wss://kijumbesmart.co.tz:2025:8188
JANUS_JS_URL=https://kijumbesmart.co.tz:2025:8088/janus.js
```

## Backup and Restore

### Creating a Backup

```bash
./manage.sh backup
```

This will create a timestamped backup in the `/backups/kijumbesmart` directory.

### Restoring from Backup

1. Stop the application:
   ```bash
   ./manage.sh stop
   ```

2. Restore the database:
   ```bash
   docker-compose exec -T db psql -U postgres -d kijumbesmart < /path/to/backup.sql
   ```

3. Start the application:
   ```bash
   ./manage.sh start
   ```

## Troubleshooting

### Viewing Logs

```bash
# View all logs
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f app
```

### Common Issues

1. **Port conflicts**: Make sure the required ports are not in use by other services.
2. **Permission issues**: Ensure the Docker user has the necessary permissions.
3. **Docker daemon not running**: Start the Docker service with `sudo systemctl start docker`.
4. **Out of memory**: Increase the Docker memory limit in the Docker Desktop settings or add swap space to your server.

## Security Considerations

1. Always use strong passwords for all services.
2. Keep your server and Docker images updated.
3. Use a firewall to restrict access to only necessary ports.
4. Regularly back up your data.
5. Monitor your application logs for suspicious activity.

## Updating the Application

To update to the latest version:

```bash
# Pull the latest changes
git pull

# Rebuild and restart the containers
./manage.sh update
## Support

For support, please contact [your support email] or open an issue on the GitHub repository.
