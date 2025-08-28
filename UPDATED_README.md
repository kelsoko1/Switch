# 🚀 Kijumbe Rotational Savings Platform v2.0

A comprehensive rotational savings platform with WhatsApp integration and complete authentication system, built for the Tanzanian market.

## ✨ New Features in v2.0

- **🔐 Complete Authentication System**: JWT-based auth with role-based permissions
- **👑 Super Admin Access**: Pre-configured super admin with full system control
- **🛡️ Enhanced Security**: bcrypt password hashing, secure token validation
- **🔄 User Management**: Register, login, profile management, admin creation
- **📊 Admin Dashboard**: Comprehensive user and system management
- **🌐 Production Ready**: Environment-based configuration, error handling

## 🔐 Authentication Features

### User Roles & Permissions
- **🔴 Super Admin**: Complete system access (admin@kijumbe.com)
- **🟠 Admin**: User management, system administration
- **🟡 Kiongozi**: Group leadership, create and manage savings groups
- **🟢 Member**: Basic user access, join groups, make transactions

### Security Features
- JWT token authentication with configurable expiration
- bcrypt password hashing (12 salt rounds)
- Role-based access control for all endpoints
- Secure middleware for route protection
- Environment-based configuration

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd kijumbe

# Run automated setup with authentication
start-with-auth.bat
```

### Option 2: Manual Setup
```bash
# Install all dependencies
npm install

# Build frontend (if needed)
cd frontend && npm install && npm run build && cd ..

# Start the application
npm start
```

### 🔐 Default Super Admin Access
After starting the server, login with:
- **Email**: `admin@kijumbe.com`
- **Password**: `admin123456`
- **Access URLs**:
  - Frontend: http://localhost:3000
  - Backend Admin: http://localhost:3000/backend
  - API Base: http://localhost:3000/backend/auth

## 🔧 API Endpoints

### Authentication
```
POST /backend/auth/register     - Register new user
POST /backend/auth/login        - User login
GET  /backend/auth/profile      - Get user profile
PUT  /backend/auth/profile      - Update profile
POST /backend/auth/logout       - User logout
GET  /backend/auth/users        - Get all users (admin only)
POST /backend/auth/create-admin - Create admin (super admin only)
GET  /backend/auth/health       - Health check
```

### Admin Management
```
GET  /backend/admin/users       - User management
GET  /backend/admin/statistics  - System statistics
POST /backend/admin/groups      - Create groups (admin override)
```

### Groups & Transactions
```
GET  /backend/groups           - List groups
POST /backend/groups/create    - Create group (kiongozi)
POST /backend/groups/join      - Join group
GET  /backend/transactions     - List transactions
POST /backend/transactions     - Create transaction
```

## 🧪 Testing

### Run Authentication Tests
```bash
# Test all authentication endpoints
node test-complete-auth.js

# Check system setup
node setup-auth.js
```

### Test Results Include:
- ✅ Health check and server connectivity
- ✅ Super admin login functionality
- ✅ User registration and login
- ✅ Profile management
- ✅ Admin user creation
- ✅ Role-based access control

## 🌍 Environment Configuration

### Development (.env)
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=24h
SUPER_ADMIN_EMAIL=admin@kijumbe.com
SUPER_ADMIN_PASSWORD=admin123456
```

### Production
```env
NODE_ENV=production
PORT=80
FRONTEND_URL=https://your-domain.com
JWT_SECRET=ultra_secure_production_jwt_secret_minimum_32_characters
SUPER_ADMIN_PASSWORD=your_super_secure_production_password
```

## 🏗️ Production Deployment

### Automated Production Setup
```bash
# Windows
start-production.bat

# Linux/Mac
npm run production
```

### Manual Production Steps
1. Set environment variables for production
2. Build frontend: `cd frontend && npm run build`
3. Start server: `NODE_ENV=production npm start`
4. Access application at your domain
5. Login with super admin credentials

### PM2 Process Manager (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name "kijumbe" --env production
pm2 save
pm2 startup
```

## 🛡️ Security Considerations

### For Production:
1. **Change Default Passwords**: Update super admin password immediately
2. **Secure JWT Secret**: Use a strong, unique JWT secret (minimum 32 characters)
3. **Environment Variables**: Never commit .env files to version control
4. **HTTPS**: Always use HTTPS in production
5. **Database**: Replace in-memory storage with persistent database
6. **Rate Limiting**: Configure appropriate rate limits for your use case

## 📚 Documentation Files

- **[AUTHENTICATION_FIXES.md](./AUTHENTICATION_FIXES.md)**: Authentication system details
- **[DUAL_AUTHENTICATION_GUIDE.md](./DUAL_AUTHENTICATION_GUIDE.md)**: Dual auth setup
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)**: Production deployment guide
- **[WHATSAPP_INTEGRATION_GUIDE.md](./WHATSAPP_INTEGRATION_GUIDE.md)**: WhatsApp setup

## 🔄 Migration from v1.0

If upgrading from the previous version:

1. **Backup existing data** (if any)
2. **Install new dependencies**: `npm install`
3. **Update environment variables** with authentication settings
4. **Test authentication** with `node test-complete-auth.js`
5. **Update admin credentials** for production use

## 🚨 Troubleshooting

### Common Issues

1. **Authentication fails**
   - Check JWT_SECRET is set in environment
   - Verify server is running on correct port
   - Ensure dependencies are installed

2. **Super admin login not working**
   - Check default credentials: admin@kijumbe.com / admin123456
   - Verify server started successfully
   - Check server logs for initialization messages

3. **API endpoints not found**
   - Confirm routes are properly imported in server.js
   - Check request URLs match the expected format
   - Verify authentication headers are included

### Getting Help
- Check server logs for detailed error messages
- Run health check: `GET /backend/auth/health`
- Test authentication: `node test-complete-auth.js`
- Verify environment variables are set correctly

## 📈 Performance & Scalability

- **In-Memory Storage**: Current user storage is in-memory (development only)
- **Database Integration**: Ready for MongoDB, PostgreSQL, or other databases
- **Horizontal Scaling**: Stateless JWT design supports load balancing
- **Caching**: Redis integration ready for session caching

## 🎯 Roadmap

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Advanced user management features
- [ ] Two-factor authentication (2FA)
- [ ] Social login integration
- [ ] Advanced audit logging
- [ ] Email verification system
- [ ] Password reset functionality

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 🎉 Ready to Go!

Your Kijumbe platform is now equipped with a complete authentication system. Start the server and login with the super admin credentials to begin managing your rotational savings platform!

**Super Admin Login**: admin@kijumbe.com / admin123456
