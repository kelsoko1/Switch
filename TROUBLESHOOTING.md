# Kijumbe Troubleshooting Guide

## Common Errors and Solutions

### CORS Errors

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/login' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Solution:**
1. Make sure the backend CORS configuration includes the frontend origin:
   ```javascript
   // In src/server.js
   app.use(cors({
     origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
     credentials: true
   }));
   ```

2. Ensure the frontend is using the Vite proxy correctly:
   ```javascript
   // In frontend/src/services/api.js
   export const api = axios.create({
     baseURL: '/api',
     headers: {
       'Content-Type': 'application/json',
     },
     withCredentials: true
   });
   ```

3. Check that the Vite proxy is configured:
   ```javascript
   // In frontend/vite.config.js
   server: {
     port: 3001,
     proxy: {
       '/api': {
         target: 'http://localhost:3000',
         changeOrigin: true,
         secure: false,
       },
     },
   },
   ```

### Connection Refused Errors

**Error:**
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**Solution:**
1. Check if the backend server is running:
   ```bash
   # Start the backend
   node src/server.js
   ```

2. Check if the frontend server is running:
   ```bash
   # Start the frontend
   cd frontend
   npm run dev
   ```

3. Verify the ports are correct and not in use by other applications:
   - Backend should be on port 3000
   - Frontend should be on port 3001

4. Use the provided start script:
   ```bash
   # Start both servers
   start-dev.bat
   ```

### Module Not Found Errors

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
1. Reinstall dependencies:
   ```bash
   # Delete node_modules and reinstall
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   ```

2. Check if the package.json has all required dependencies:
   ```json
   "dependencies": {
     "appwrite": "^14.0.1",
     "axios": "^1.6.2",
     "bcryptjs": "^2.4.3",
     "cors": "^2.8.5",
     "dotenv": "^16.3.1",
     "express": "^4.18.2",
     "express-validator": "^7.0.1",
     "helmet": "^7.1.0",
     "jsonwebtoken": "^9.0.2",
     "morgan": "^1.10.0"
   }
   ```

3. Try installing specific dependencies directly:
   ```bash
   npm install express cors dotenv helmet morgan bcryptjs jsonwebtoken express-validator appwrite axios
   ```

### Environment Variables Not Found

**Error:**
```
Error: Environment variable not found
```

**Solution:**
1. Create a `.env` file in the root directory based on the `env.example` template
2. Create a `.env` file in the frontend directory based on the `env.example` template
3. Ensure all required environment variables are set

## Quick Start Guide

For a clean start:

1. **Start the backend:**
   ```bash
   node src/server.js
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Or use the combined start script:**
   ```bash
   start-dev.bat
   ```

4. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api
   - Health Check: http://localhost:3000/api/health

## Debugging Tips

1. **Check server logs** for error messages
2. **Use browser developer tools** to inspect network requests
3. **Verify CORS headers** in network responses
4. **Check for port conflicts** with other applications
5. **Restart both servers** if changes don't take effect

## Common Commands

```bash
# Start backend
node src/server.js

# Start frontend
cd frontend && npm run dev

# Check backend health
curl http://localhost:3000/api/health

# Create superadmin (after fixing dependencies)
node create-superadmin-simple.js
```
