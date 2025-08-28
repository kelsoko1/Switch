# 🚀 Kijumbe Production Setup Guide

## Prerequisites
- Node.js 16+ and npm 8+
- Appwrite Cloud account
- Domain name (for production)
- SSL certificate (for HTTPS)

## 1. Environment Configuration

### Create Production .env File
Copy `env.example` to `.env` and update with your production values:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Appwrite Configuration
APPWRITE_ENDPOINT=https://your-appwrite-endpoint/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_PROJECT_NAME=kijumbe
APPWRITE_API_KEY=your_production_api_key

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-2024

# Payment Gateway (Selcom)
SELCOM_BASE_URL=https://pay.selcom.co.tz
SELCOM_API_KEY=your_selcom_api_key
SELCOM_API_SECRET=your_selcom_api_secret

# WhatsApp Integration (GreenAPI)
GREENAPI_API_URL=https://your-instance.api.greenapi.com
GREENAPI_MEDIA_URL=https://your-instance.media.greenapi.com
GREENAPI_ID_INSTANCE=your_instance_id
GREENAPI_API_TOKEN_INSTANCE=your_api_token
GREENAPI_BOT_PHONE=your_bot_phone_number

# Insurance Integration
INSURANCE_API_URL=https://api.insurance.co.tz
INSURANCE_API_KEY=your_insurance_api_key
```

## 2. Appwrite Setup

### Create Appwrite Project
1. Go to [Appwrite Console](https://console.appwrite.io/)
2. Create a new project named "kijumbe"
3. Note your Project ID

### Generate API Key
1. Go to Project Settings > API Keys
2. Create a new API Key with the following permissions:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `documents.read`
   - `documents.write`
   - `users.read`
   - `users.write`

### Update .env File
Replace the placeholder values with your actual Appwrite credentials.

## 3. Frontend Build

### Install Dependencies
```bash
cd frontend
npm install
```

### Build for Production
```bash
npm run build
```

This creates the `frontend/build` directory that the server serves.

## 4. Backend Setup

### Install Dependencies
```bash
npm install
```

### Test Configuration
```bash
npm run dev
```

Check the console for any configuration errors.

## 5. Production Deployment

### Option 1: Windows Batch File
```bash
start-production.bat
```

### Option 2: Manual Start
```bash
set NODE_ENV=production
npm start
```

### Option 3: PM2 (Recommended for Production)
```bash
npm install -g pm2
pm2 start server.js --name "kijumbe"
pm2 save
pm2 startup
```

## 6. Production Checklist

- [ ] Environment variables configured
- [ ] Appwrite API key with proper permissions
- [ ] Frontend built (`npm run build`)
- [ ] SSL certificate installed (for HTTPS)
- [ ] Domain configured
- [ ] Firewall rules updated
- [ ] Database collections created
- [ ] Super admin account accessible

## 7. Security Considerations

### JWT Secret
- Use a strong, random JWT secret
- Never commit .env files to version control
- Rotate secrets regularly

### API Keys
- Use environment variables for all sensitive data
- Implement rate limiting (already configured)
- Use HTTPS in production

### Database
- Regular backups
- Monitor access logs
- Implement proper user authentication

## 8. Monitoring & Maintenance

### Health Check
- Endpoint: `http://yourdomain.com/health`
- Monitor response times and status

### Logs
- Check server logs regularly
- Monitor error rates
- Set up alerting for critical errors

### Updates
- Keep dependencies updated
- Monitor security advisories
- Test updates in staging environment

## 9. Troubleshooting

### Common Issues

#### Database Connection Failed
- Check Appwrite API key permissions
- Verify endpoint URL
- Ensure project ID is correct

#### Frontend Not Loading
- Verify `frontend/build` directory exists
- Check file permissions
- Ensure static file serving is configured

#### JWT Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper authentication middleware

### Support
For additional support, check the logs and refer to the Appwrite documentation.

## 10. Performance Optimization

### Production Build
- Frontend is already optimized with React build
- Static assets are served efficiently
- API responses are cached where appropriate

### Database
- Use Appwrite indexes for frequently queried fields
- Implement pagination for large datasets
- Monitor query performance

---

**🎉 Your Kijumbe application is now ready for production!**

Access your application at: `http://yourdomain.com`
API endpoints: `http://yourdomain.com/backend/*`
Health check: `http://yourdomain.com/health`
