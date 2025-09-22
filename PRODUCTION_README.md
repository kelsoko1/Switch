# KijumbeSmart Production Setup

This document provides instructions for setting up the KijumbeSmart application in a production environment using the domain kijumbesmart.co.tz and running on port 2025.

## Quick Start

For a complete automated setup, run:

```bash
# Make the script executable
chmod +x setup.sh

# Run the setup script as root
sudo ./setup.sh
```

This will install all dependencies, configure the application, and set up all necessary services.

## Available Scripts

The following scripts are available to help manage the application:

### Setup Scripts

- `setup.sh` - Master setup script that runs all necessary steps
- `install-dependencies.sh` - Installs all required dependencies
- `setup-cron.sh` - Sets up cron jobs for monitoring and backups

### Maintenance Scripts

- `update-app.sh` - Updates the application with the latest code
- `backup.sh` - Creates a backup of the application
- `monitor.sh` - Monitors the application and restarts it if it goes down
- `health-check.sh` - Checks the health of the application

## Manual Setup

If you prefer to set up the application manually, follow these steps:

1. Install dependencies:
   ```bash
   sudo ./install-dependencies.sh
   ```

2. Update environment files:
   ```bash
   node update-env.js
   ```

3. Build the application:
   ```bash
   npm install
   npm run build
   ```

4. Set up PM2:
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 startup systemd
   pm2 save
   ```

5. Set up systemd service:
   ```bash
   sudo cp kijumbesmart.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable kijumbesmart.service
   ```

6. Set up Nginx:
   ```bash
   sudo cp kijumbesmart.conf /etc/nginx/sites-available/
   sudo ln -sf /etc/nginx/sites-available/kijumbesmart.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. Set up SSL with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d kijumbesmart.co.tz -d www.kijumbesmart.co.tz
   ```

8. Set up cron jobs:
   ```bash
   sudo ./setup-cron.sh
   ```

## Configuration Files

- `ecosystem.config.js` - PM2 configuration file
- `kijumbesmart.service` - Systemd service file
- `kijumbesmart.conf` - Nginx configuration file

## Environment Files

- `frontend-env-template.txt` - Template for frontend environment variables
- `server-env-template.txt` - Template for server environment variables

## Monitoring and Maintenance

### Monitoring

To monitor the application:

```bash
pm2 monit
```

To check the application logs:

```bash
pm2 logs kijumbesmart-app
```

To check the health of the application:

```bash
./health-check.sh
```

### Updating

To update the application with the latest code:

```bash
sudo ./update-app.sh
```

### Backups

To create a backup manually:

```bash
sudo ./backup.sh
```

Backups are stored in `/var/backups/kijumbesmart` and are automatically created daily at 2 AM.

## Troubleshooting

### Quick Fix

If you encounter issues during deployment, use the quick-fix script:

```bash
sudo ./quick-fix.sh
```

This script will:
1. Reset the Nginx configuration to HTTP only
2. Ensure the application is running on port 2025
3. Update environment files
4. Restart all services

### SSL Setup

If you need to set up SSL after the application is running:

```bash
sudo ./setup-ssl.sh
```

### Nginx Configuration

If you need to fix the Nginx configuration:

```bash
sudo ./fix-nginx.sh
```

### Common Troubleshooting Commands

1. Check the PM2 status:
   ```bash
   pm2 status
   ```

2. Check the application logs:
   ```bash
   pm2 logs kijumbesmart-app
   ```

3. Check the Nginx logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. Check the systemd service status:
   ```bash
   sudo systemctl status kijumbesmart.service
   ```

5. Run the health check:
   ```bash
   ./health-check.sh
   ```

### Detailed Troubleshooting Guide

For more detailed troubleshooting information, refer to [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Security Considerations

1. The application is configured to use HTTPS with SSL certificates from Let's Encrypt.
2. The firewall is configured to allow only necessary ports (22, 80, 443, 2025).
3. The application runs as a systemd service, which ensures it starts automatically on system boot.
4. Regular backups are created to prevent data loss.
5. The application is monitored and automatically restarted if it goes down.

## Additional Documentation

For more detailed information, refer to:

- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [REALTIME_SETUP.md](REALTIME_SETUP.md) - Setup guide for real-time services
- [APPWRITE_SETUP.md](APPWRITE_SETUP.md) - Setup guide for Appwrite
- [KIJUMBE_INTEGRATION_GUIDE.md](KIJUMBE_INTEGRATION_GUIDE.md) - Guide for Kijumbe integration
