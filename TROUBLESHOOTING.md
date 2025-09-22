# KijumbeSmart Deployment Troubleshooting Guide

This guide provides solutions to common issues that may occur during the deployment of the KijumbeSmart application.

## SSL Certificate Issues

### Error: Cannot load certificate

```
[emerg] cannot load certificate "/etc/letsencrypt/live/kijumbesmart.co.tz/fullchain.pem": BIO_new_file() failed
```

This error occurs when Nginx is configured to use SSL certificates that don't exist yet.

**Solution:**

1. Use the provided fix-nginx.sh script to create a basic HTTP-only configuration:
   ```bash
   sudo ./fix-nginx.sh
   ```

2. After the domain is properly configured and accessible via HTTP, set up SSL:
   ```bash
   sudo ./setup-ssl.sh
   ```

### Error: Failed to set up SSL certificates

This can happen if:
- The domain is not properly configured to point to your server
- There are DNS propagation issues
- Let's Encrypt rate limits have been reached

**Solution:**

1. Verify that the domain is properly configured:
   ```bash
   nslookup kijumbesmart.co.tz
   ```

2. Check if the domain is accessible via HTTP:
   ```bash
   curl -I http://kijumbesmart.co.tz
   ```

3. Wait for DNS propagation (can take up to 48 hours)

4. Try setting up SSL manually:
   ```bash
   sudo certbot --nginx -d kijumbesmart.co.tz -d www.kijumbesmart.co.tz
   ```

## Nginx Configuration Issues

### Error: Nginx configuration test failed

**Solution:**

1. Check the Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. Use the fix-nginx.sh script to reset to a basic working configuration:
   ```bash
   sudo ./fix-nginx.sh
   ```

3. Manually edit the Nginx configuration if needed:
   ```bash
   sudo nano /etc/nginx/sites-available/kijumbesmart.conf
   ```

## Application Not Starting

### Error: Application is not running on port 2025

**Solution:**

1. Check the PM2 status:
   ```bash
   pm2 status
   ```

2. Check the PM2 logs:
   ```bash
   pm2 logs kijumbesmart-app
   ```

3. Try restarting the application:
   ```bash
   pm2 restart kijumbesmart-app
   ```

4. Check if the port is already in use:
   ```bash
   sudo netstat -tuln | grep 2025
   ```

5. If another process is using the port, either stop that process or change the port in the environment files.

### Error: systemd service is not active

**Solution:**

1. Check the service status:
   ```bash
   sudo systemctl status kijumbesmart.service
   ```

2. Check the service logs:
   ```bash
   sudo journalctl -u kijumbesmart.service
   ```

3. Try restarting the service:
   ```bash
   sudo systemctl restart kijumbesmart.service
   ```

## Build Issues

### Error: Failed to build the application

**Solution:**

1. Check for Node.js and npm errors:
   ```bash
   node -v
   npm -v
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

3. Remove node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

4. Check for TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

## Domain Configuration Issues

### Error: Domain is not accessible

**Solution:**

1. Verify that the domain is properly configured in your DNS settings

2. Check if the domain is pointing to your server's IP address:
   ```bash
   nslookup kijumbesmart.co.tz
   ```

3. Make sure your firewall allows traffic on ports 80 and 443:
   ```bash
   sudo ufw status
   ```

4. If needed, add firewall rules:
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   ```

## Environment Configuration Issues

### Error: Environment variables not set correctly

**Solution:**

1. Check the environment files:
   ```bash
   cat .env.local
   cat server/.env
   ```

2. Regenerate the environment files:
   ```bash
   node update-env.js
   ```

3. Make sure the port and domain are correctly set in the environment files.

## Manual Recovery

If all else fails, you can manually set up the application:

1. Set up Nginx with a basic configuration:
   ```bash
   sudo ./fix-nginx.sh
   ```

2. Start the application manually:
   ```bash
   cd /root/switch
   PORT=2025 NODE_ENV=production node server/index.js
   ```

3. If that works, set up PM2:
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

4. Set up SSL after the application is running:
   ```bash
   sudo ./setup-ssl.sh
   ```

## Getting Help

If you're still experiencing issues, check the following resources:

1. Application logs:
   ```bash
   pm2 logs kijumbesmart-app
   ```

2. Nginx logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. System logs:
   ```bash
   sudo journalctl -xe
   ```

4. Run the health check script for a comprehensive status report:
   ```bash
   sudo ./health-check.sh
   ```
