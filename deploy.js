import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PRODUCTION_DOMAIN = 'kijumbesmart.co.tz';
const PRODUCTION_URL = `https://${PRODUCTION_DOMAIN}`;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const color = type === 'success' ? colors.green 
                : type === 'info' ? colors.blue
                : type === 'warning' ? colors.yellow
                : colors.red;
    
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

async function deploy() {
    try {
        // 1. Build the frontend
        log('Building frontend application...');
        process.chdir(path.join(__dirname));
        execSync('npm run build', { stdio: 'inherit' });
        log('Frontend build completed successfully', 'success');

        // 2. Build the server
        log('Building server application...');
        process.chdir(path.join(__dirname, 'server'));
        execSync('npm run build', { stdio: 'inherit' });
        log('Server build completed successfully', 'success');

        // 3. Update environment files
        log('Updating environment configuration...');
        const envContent = `
PORT=2025
NODE_ENV=production
FRONTEND_URL=${PRODUCTION_URL}
APPWRITE_ENDPOINT=${process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'}
APPWRITE_PROJECT_ID=${process.env.APPWRITE_PROJECT_ID}
APPWRITE_API_KEY=${process.env.APPWRITE_API_KEY}
APPWRITE_DATABASE_ID=${process.env.APPWRITE_DATABASE_ID}
JWT_SECRET=${process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'}
JWT_EXPIRES_IN=24h
COLLECTION_USERS=users
COLLECTION_GROUPS=groups
COLLECTION_MEMBERS=members
COLLECTION_TRANSACTIONS=transactions
COLLECTION_PAYMENTS=payments
COLLECTION_OVERDRAFTS=overdrafts
COLLECTION_WALLETS=wallets
COLLECTION_WALLET_TRANSACTIONS=wallet_transactions
COLLECTION_WALLET_PAYMENTS=wallet_payments
`.trim();

        fs.writeFileSync(path.join(__dirname, 'server', '.env.production'), envContent);
        log('Environment configuration updated', 'success');

        // 4. Create production deployment scripts
        const startScript = `
#!/bin/bash
export NODE_ENV=production
cd "$(dirname "$0")"
pm2 start ecosystem.config.js
`.trim();

        const ecosystemConfig = `
module.exports = {
  apps: [{
    name: 'switch-server',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 2025
    },
    max_memory_restart: '1G',
    error_file: 'logs/error.log',
    out_file: 'logs/output.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
`.trim();

        const nginxConfig = `
server {
    listen 80;
    server_name ${PRODUCTION_DOMAIN} www.${PRODUCTION_DOMAIN};

    location / {
        proxy_pass http://localhost:2025;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml;
    gzip_disable "MSIE [1-6]\\.";

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "no-referrer-when-downgrade";
    add_header Content-Security-Policy "default-src 'self' https: http: data: blob: 'unsafe-inline' 'unsafe-eval'";
}

server {
    listen 443 ssl http2;
    server_name ${PRODUCTION_DOMAIN} www.${PRODUCTION_DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${PRODUCTION_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${PRODUCTION_DOMAIN}/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS (uncomment if you're sure)
    # add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://localhost:2025;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Same gzip and security headers as HTTP server
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml;
    gzip_disable "MSIE [1-6]\\.";

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "no-referrer-when-downgrade";
    add_header Content-Security-Policy "default-src 'self' https: http: data: blob: 'unsafe-inline' 'unsafe-eval'";
}
`.trim();

        // Write deployment files
        fs.writeFileSync(path.join(__dirname, 'server', 'start.sh'), startScript);
        fs.writeFileSync(path.join(__dirname, 'server', 'ecosystem.config.js'), ecosystemConfig);
        fs.writeFileSync(path.join(__dirname, 'server', 'nginx.conf'), nginxConfig);
        execSync('chmod +x start.sh', { cwd: path.join(__dirname, 'server') });
        
        log('Created deployment scripts', 'success');

        // 5. Create deployment instructions
        const deploymentInstructions = `
# Deployment Instructions for ${PRODUCTION_DOMAIN}

## Prerequisites
1. Node.js 18+ and npm installed
2. PM2 installed globally: \`npm install -g pm2\`
3. Nginx installed
4. Domain pointed to your server
5. SSL certificate (Let's Encrypt recommended)

## Deployment Steps

1. Copy the build files to your server:
   \`\`\`bash
   scp -r dist/* user@your-server:/path/to/app
   scp .env.production user@your-server:/path/to/app/.env
   scp ecosystem.config.js user@your-server:/path/to/app/
   scp start.sh user@your-server:/path/to/app/
   \`\`\`

2. Set up Nginx:
   \`\`\`bash
   sudo cp nginx.conf /etc/nginx/sites-available/${PRODUCTION_DOMAIN}
   sudo ln -s /etc/nginx/sites-available/${PRODUCTION_DOMAIN} /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   \`\`\`

3. Set up SSL with Let's Encrypt:
   \`\`\`bash
   sudo certbot --nginx -d ${PRODUCTION_DOMAIN} -d www.${PRODUCTION_DOMAIN}
   \`\`\`

4. Start the application:
   \`\`\`bash
   cd /path/to/app
   ./start.sh
   \`\`\`

5. Monitor the application:
   \`\`\`bash
   pm2 status
   pm2 logs
   \`\`\`

## Maintenance

- View logs: \`pm2 logs switch-server\`
- Restart app: \`pm2 restart switch-server\`
- Update SSL: \`sudo certbot renew\`

## Troubleshooting

1. Check application logs:
   \`\`\`bash
   pm2 logs switch-server --lines 100
   \`\`\`

2. Check Nginx logs:
   \`\`\`bash
   sudo tail -f /var/log/nginx/error.log
   \`\`\`

3. Check SSL status:
   \`\`\`bash
   sudo certbot certificates
   \`\`\`
`.trim();

        fs.writeFileSync(path.join(__dirname, 'DEPLOYMENT.md'), deploymentInstructions);
        log('Created deployment instructions', 'success');

        log('Deployment preparation completed successfully! See DEPLOYMENT.md for instructions.', 'success');
    } catch (error) {
        log(`Deployment failed: ${error.message}`, 'error');
        process.exit(1);
    }
}

deploy().catch(error => {
    log(`Deployment failed: ${error.message}`, 'error');
    process.exit(1);
});
