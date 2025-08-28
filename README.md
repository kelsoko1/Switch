# 🚀 Kijumbe Rotational Savings Platform

A comprehensive rotational savings platform with WhatsApp integration, built for the Tanzanian market.

## ✨ Features

- **Rotational Savings Management**: Create and manage savings groups
- **WhatsApp Integration**: Automated notifications and updates via WhatsApp
- **Payment Processing**: Integration with Selcom payment gateway
- **User Management**: Role-based access control (Admin, Kiongozi, Member)
- **Financial Tracking**: Comprehensive transaction and payment history
- **Mobile-First Design**: Responsive React frontend with Tailwind CSS
- **Secure API**: JWT authentication with rate limiting

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- Appwrite Cloud account

### 1. Clone and Install
```bash
git clone <repository-url>
cd kijumbe
npm run install-all
```

### 2. Environment Setup
```bash
# Copy environment template
copy env.example .env

# Edit .env with your credentials
# See PRODUCTION_SETUP.md for detailed instructions
```

### 3. Build Frontend
```bash
npm run build
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/backend
- **Health Check**: http://localhost:3000/health

## 🏗️ Production Deployment

### Windows (Recommended)
```bash
start-production.bat
```

### Manual Production Start
```bash
set NODE_ENV=production
npm start
```

### PM2 (Advanced)
```bash
npm install -g pm2
pm2 start server.js --name "kijumbe"
pm2 save
pm2 startup
```

## 📚 Documentation

- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)**: Complete production deployment guide
- **[APPWRITE_SETUP.md](./APPWRITE_SETUP.md)**: Appwrite configuration guide

## 🔧 Configuration

### Environment Variables
- `APPWRITE_ENDPOINT`: Your Appwrite instance URL
- `APPWRITE_PROJECT_ID`: Your Appwrite project ID
- `APPWRITE_API_KEY`: Your Appwrite API key
- `JWT_SECRET`: Secret key for JWT tokens
- `GREENAPI_*`: WhatsApp integration settings
- `SELCOM_*`: Payment gateway settings

### Appwrite Setup
1. Create a new project in Appwrite Console
2. Generate API key with database permissions
3. Update `.env` file with your credentials
4. Restart the application

## 🏛️ Architecture

```
kijumbe/
├── frontend/          # React application
├── routes/           # API endpoints
├── config/           # Configuration files
├── middleware/       # Authentication & validation
└── server.js         # Express server
```

## 🔐 Security Features

- JWT-based authentication
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS configuration
- Input validation and sanitization

## 📱 WhatsApp Integration

- Automated group updates
- Payment reminders
- Transaction notifications
- Member communication

## 💳 Payment Integration

- Selcom payment gateway
- Mobile money support
- Transaction tracking
- Payment history

## 👥 User Roles

- **Super Admin**: Full system access
- **Admin**: Group and user management
- **Kiongozi**: Group leadership
- **Member**: Basic group participation

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Appwrite API key permissions
   - Verify endpoint URL and project ID

2. **Frontend Not Loading**
   - Ensure `npm run build` completed successfully
   - Check `frontend/build` directory exists

3. **JWT Errors**
   - Verify `JWT_SECRET` is set in `.env`
   - Check token expiration

### Getting Help
- Check server logs for detailed error messages
- Verify environment variables are set correctly
- Ensure all dependencies are installed

## 📈 Performance

- Optimized React production build
- Efficient static file serving
- Database query optimization
- Rate limiting for API protection

## 🔄 Updates & Maintenance

- Regular dependency updates
- Security patch monitoring
- Database backup procedures
- Performance monitoring

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the documentation
- Review server logs
- Open an issue on GitHub

---

**🎉 Kijumbe is ready for production use!**

Built with ❤️ for the Tanzanian community
