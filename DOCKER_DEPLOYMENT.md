# Docker Deployment Instructions for kijumbesmart.co.tz

## Prerequisites

1. Docker and Docker Compose installed on your server
2. Existing nginx-proxy setup with Let's Encrypt companion
3. Domain (kijumbesmart.co.tz) pointed to your server
4. Git installed on your server

## Deployment Steps

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd switch
   ```

2. Create a production environment file:
   ```bash
   cp .env.example .env.production
   ```

3. Update the environment variables in `.env.production`:
   ```env
   NODE_ENV=production
   PORT=2025
   FRONTEND_URL=https://kijumbesmart.co.tz
   APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_API_KEY=your_api_key
   APPWRITE_DATABASE_ID=your_database_id
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRES_IN=24h
   ```

4. Make sure your nginx-proxy network exists:
   ```bash
   docker network ls | grep nginx-proxy-network
   # If it doesn't exist, create it:
   # docker network create nginx-proxy-network
   ```

5. Build and start the containers:
   ```bash
   docker-compose -f docker-compose.yml --env-file .env.production up -d --build
   ```

6. Verify the deployment:
   ```bash
   docker-compose ps
   docker logs switch-app
   docker logs switch-nginx
   ```

## Integration with Existing nginx-proxy

The application is configured to work with an existing nginx-proxy setup. Make sure:

1. Your nginx-proxy container is running with these volumes:
   ```yaml
   volumes:
     - /var/run/docker.sock:/tmp/docker.sock:ro
     - certs:/etc/nginx/certs
     - vhost.d:/etc/nginx/vhost.d
     - html:/usr/share/nginx/html
   ```

2. Let's Encrypt companion container is running with:
   ```yaml
   volumes:
     - certs:/etc/nginx/certs
     - vhost.d:/etc/nginx/vhost.d
     - html:/usr/share/nginx/html
     - /var/run/docker.sock:/var/run/docker.sock:ro
   ```

## Maintenance

1. View logs:
   ```bash
   # Application logs
   docker logs -f switch-app

   # Nginx logs
   docker logs -f switch-nginx
   ```

2. Restart services:
   ```bash
   docker-compose restart
   ```

3. Update application:
   ```bash
   git pull
   docker-compose -f docker-compose.yml --env-file .env.production up -d --build
   ```

## Troubleshooting

1. Check container status:
   ```bash
   docker-compose ps
   ```

2. View detailed logs:
   ```bash
   docker-compose logs --tail=100 -f
   ```

3. Check nginx configuration:
   ```bash
   docker exec switch-nginx nginx -t
   ```

4. Check network connectivity:
   ```bash
   docker network inspect nginx-proxy-network
   ```

5. Verify SSL certificates:
   ```bash
   docker exec nginx-proxy ls -la /etc/nginx/certs/kijumbesmart.co.tz*
   ```

## Security Notes

1. The application runs on an internal Docker network
2. Only the nginx container is exposed to the host network
3. SSL termination is handled by the nginx-proxy
4. Environment variables are stored securely
5. All containers use the latest Alpine-based images
6. Security headers are properly configured

## Monitoring

1. Container status:
   ```bash
   docker stats switch-app switch-nginx
   ```

2. Application metrics (via PM2):
   ```bash
   docker exec switch-app pm2 monit
   ```

## Backup

1. Database backups are handled by Appwrite
2. Container configuration:
   ```bash
   docker-compose config > backup/docker-compose-$(date +%F).yml
   ```

3. Environment variables:
   ```bash
   cp .env.production backup/.env.production.$(date +%F)
   ```
