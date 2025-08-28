# 🚀 Deployment Checklist

## ✅ Pre-Deployment

- [ ] Environment variables configured in `.env`
- [ ] Appwrite project created and configured
- [ ] API key generated with proper permissions
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend built (`npm run build`)

## ✅ Environment Variables

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` (strong, random string)
- [ ] `APPWRITE_ENDPOINT` (your Appwrite URL)
- [ ] `APPWRITE_PROJECT_ID` (your project ID)
- [ ] `APPWRITE_API_KEY` (your API key)
- [ ] `GREENAPI_*` (WhatsApp integration)
- [ ] `SELCOM_*` (payment gateway)

## ✅ Appwrite Configuration

- [ ] Project created in Appwrite Console
- [ ] API key with database permissions:
  - [ ] `databases.read`
  - [ ] `databases.write`
  - [ ] `collections.read`
  - [ ] `collections.write`
  - [ ] `documents.read`
  - [ ] `documents.write`
  - [ ] `users.read`
  - [ ] `users.write`

## ✅ Frontend Build

- [ ] `frontend/build` directory exists
- [ ] `frontend/build/index.html` exists
- [ ] No build errors in console
- [ ] Static assets generated

## ✅ Server Configuration

- [ ] Port 3000 available
- [ ] Static file serving configured
- [ ] API routes working (`/health` endpoint)
- [ ] Error handling middleware
- [ ] Rate limiting enabled

## ✅ Security

- [ ] JWT secret configured
- [ ] Rate limiting active
- [ ] Helmet security headers
- [ ] CORS configured
- [ ] Environment variables not exposed

## ✅ Testing

- [ ] Health endpoint: `http://localhost:3000/health`
- [ ] Frontend loads: `http://localhost:3000/`
- [ ] API accessible: `http://localhost:3000/backend/*`
- [ ] Database connection successful
- [ ] Collections created automatically

## ✅ Production Start

### Option 1: Windows Batch
```bash
start-production.bat
```

### Option 2: Manual
```bash
set NODE_ENV=production
npm start
```

### Option 3: PM2
```bash
npm install -g pm2
pm2 start server.js --name "kijumbe"
pm2 save
pm2 startup
```

## ✅ Post-Deployment

- [ ] Application accessible at configured URL
- [ ] All API endpoints responding
- [ ] Database operations working
- [ ] Frontend rendering correctly
- [ ] Error logs monitored
- [ ] Performance metrics tracked

## 🚨 Troubleshooting

### If Frontend Won't Load
1. Check `frontend/build` directory exists
2. Verify static file serving in `server.js`
3. Check file permissions

### If Database Connection Fails
1. Verify Appwrite API key permissions
2. Check endpoint URL and project ID
3. Ensure API key has database access

### If JWT Errors Occur
1. Verify `JWT_SECRET` is set
2. Check token expiration
3. Ensure authentication middleware

## 📞 Support

- Check server logs for detailed errors
- Verify all environment variables
- Test individual components
- Review Appwrite Console for errors

---

**🎯 Ready for Production!**

Run `start-production.bat` to launch your application.
