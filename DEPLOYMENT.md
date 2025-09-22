# KijumbeSmart Deployment Guide

This guide provides instructions for deploying the KijumbeSmart application to a production server using the domain kijumbesmart.co.tz.

## Prerequisites

- Ubuntu 20.04 or later server
- Root access to the server
- Domain (kijumbesmart.co.tz) pointing to your server's IP address
- Node.js 16+ and npm installed

## Automatic Deployment

For automatic deployment, use the provided `deploy.sh` script:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script as root
sudo ./deploy.sh
```

The script will:
1. Install required dependencies (nginx, certbot, nodejs, npm)
2. Install PM2 globally
3. Create environment files
4. Build the application
5. Set up PM2 to start on boot
6. Configure systemd service
7. Set up Nginx with the domain
8. Configure SSL with Let's Encrypt
9. Start all services

## Manual Deployment

If you prefer to deploy manually, follow these steps:

### 1. Update Environment Files

```bash
# Generate environment files
node update-env.js
```

### 2. Build the Application

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

### 3. Set Up PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the application with PM2
pm2 start ecosystem.config.js --env production

# Set PM2 to start on boot
pm2 startup systemd
pm2 save
```

### 4. Configure Systemd Service

```bash
# Copy the service file
cp kijumbesmart.service /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable and start the service
systemctl enable kijumbesmart.service
systemctl start kijumbesmart.service
```

### 5. Configure Nginx

```bash
# Copy the Nginx configuration
cp kijumbesmart.conf /etc/nginx/sites-available/

# Create a symbolic link
ln -sf /etc/nginx/sites-available/kijumbesmart.conf /etc/nginx/sites-enabled/

# Test and restart Nginx
nginx -t
systemctl restart nginx
```

### 6. Set Up SSL with Let's Encrypt

```bash
certbot --nginx -d kijumbesmart.co.tz -d www.kijumbesmart.co.tz
```

## Verifying the Deployment

After deployment, verify that:

1. The application is running on port 2025:
   ```bash
   netstat -tuln | grep 2025
   ```

2. PM2 is managing the application:
   ```bash
   pm2 status
   ```

3. Nginx is properly configured:
   ```bash
   nginx -t
   ```

4. The website is accessible via HTTPS:
   ```bash
   curl -I https://kijumbesmart.co.tz
   ```

## Troubleshooting

### Application Not Starting

Check the PM2 logs:
```bash
pm2 logs kijumbesmart-app
```

### Nginx Configuration Issues

Check Nginx error logs:
```bash
tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

Check Let's Encrypt logs:
```bash
tail -f /var/log/letsencrypt/letsencrypt.log
```

## Maintenance

### Updating the Application

To update the application:

1. Pull the latest code
2. Build the application:
   ```bash
   npm run build
   ```
3. Restart the service:
   ```bash
   pm2 reload ecosystem.config.js
   ```

### Renewing SSL Certificates

Let's Encrypt certificates are valid for 90 days and are automatically renewed by a cron job. To manually renew:

```bash
certbot renew
```

### Monitoring

Monitor the application using PM2:

```bash
pm2 monit
```

## Security Considerations

1. Keep the server updated:
   ```bash
   apt update && apt upgrade -y
   ```

2. Configure a firewall (UFW):
   ```bash
   ufw allow 22
   ufw allow 80
   ufw allow 443
   ufw enable
   ```

3. Regularly check for security updates for Node.js and npm packages:
   ```bash
   npm audit
   ```
