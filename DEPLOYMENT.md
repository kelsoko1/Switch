# KijumbeSmart Docker Deployment Guide

This guide provides instructions for deploying the KijumbeSmart application using Docker and Docker Compose.

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Docker installed (version 20.10.0+)
- Docker Compose installed (version 1.29.0+)
- Domain (93.127.203.151:2025) pointing to your server's IP address
- Ports 80, 443, 2026, 8088, and 8188 open in your firewall

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/switch.git
cd switch
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env
nano .env  # Edit the file with your configuration
```

### 3. Deploy the Application

Use the provided deployment script:

```bash
# Make the scripts executable
chmod +x deploy.sh
chmod +x manage.sh

# Run the deployment script as root
sudo ./deploy.sh
```

The script will:
1. Pull the latest changes from the repository
2. Build the Docker images
3. Create necessary Docker networks and volumes
4. Start all containers
5. Set up proper logging and monitoring

## Application Management

Use the `manage.sh` script to manage the application:

```bash
# Start the application
./manage.sh start

# Stop the application
./manage.sh stop

# Restart the application
./manage.sh restart

# View application logs
./manage.sh logs

# View application status
./manage.sh status

# Create a backup
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
XMPP_SERVER=wss://93.127.203.151:2025:2026/ws
XMPP_DOMAIN=93.127.203.151:2025
EJABBERD_WS_URL=wss://93.127.203.151:2025:2026/ws
EJABBERD_DOMAIN=93.127.203.151:2025
EJABBERD_API_URL=https://93.127.203.151:2025:2026/api
USE_JANUS=true
JANUS_URL=wss://93.127.203.151:2025:8188
JANUS_JS_URL=https://93.127.203.151:2025:8088/janus.js
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
