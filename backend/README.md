# 🚀 Kijumbe Backend Admin Portal

A comprehensive admin panel for managing the Kijumbe Rotational Savings Platform. This backend portal provides company members with powerful tools to operate and manage the entire platform.

## ✨ Features

### 👑 Super Admin Access
- **Direct Login**: Pre-configured super admin account for immediate access
- **Role-based Access**: Admin and super admin role management
- **Secure Authentication**: JWT-based authentication with session management

### 📊 Admin Dashboard
- **Real-time Statistics**: Platform metrics including users, groups, transactions
- **Activity Monitoring**: Live feed of recent platform activities
- **Quick Actions**: Direct access to management functions

### 👥 User Management
- **User Overview**: Complete list of all registered users
- **Role Management**: Manage user roles (Member, Kiongozi, Admin)
- **Status Control**: Activate, suspend, or manage user accounts
- **User Details**: View detailed user information and group memberships

### 💰 Wallet Management
- **Financial Overview**: Total balances, deposits, and withdrawals
- **Payment Integration**: Selcom, M-Pesa, Tigo Pesa, Airtel Money status
- **Transaction Monitoring**: Real-time transaction logs and reports
- **Failed Transaction Tracking**: Monitor and resolve payment issues

### 🗄️ Appwrite Database Management
- **Connection Monitoring**: Real-time database connection status
- **Collection Management**: View and manage all database collections
- **Database Operations**: Backup, optimization, and maintenance tools
- **Performance Metrics**: Storage usage and API call statistics

### 📱 WhatsApp Bot Management
- **Bot Status**: Monitor WhatsApp bot connection and health
- **Configuration**: View and manage bot settings
- **Test Messaging**: Send test messages to verify bot functionality
- **Feature Control**: Enable/disable bot features like auto-replies and notifications

## 🔐 Access Credentials

### Super Admin Account
- **Email**: `admin@kijumbe.com`
- **Password**: `admin123456`
- **Role**: Super Administrator (full access)

> **Note**: These credentials are automatically created and provide complete platform access.

## 🌐 Access URLs

### Backend Admin Portal
- **URL**: `http://localhost:3000/backend`
- **Alternative**: `http://localhost:3000/backend/`

### API Endpoints
- **Base URL**: `http://localhost:3000/backend`
- **Authentication**: `POST /backend/auth/login`
- **Statistics**: `GET /backend/admin/statistics`
- **Users**: `GET /backend/admin/users`
- **Wallet Stats**: `GET /backend/admin/wallet-stats`
- **WhatsApp Status**: `GET /backend/whatsapp/status`

## 🚀 Getting Started

### 1. Start the Server
```bash
npm start
# or for development
npm run dev
```

### 2. Access the Admin Portal
Navigate to `http://localhost:3000/backend` in your web browser.

### 3. Login with Super Admin
Use the pre-configured credentials to log in immediately.

### 4. Explore the Dashboard
- View platform statistics
- Manage users and groups
- Monitor financial operations
- Configure WhatsApp bot

## 📋 Management Features

### User Management
- **View All Users**: Complete user database with search and filters
- **User Details**: Individual user profiles with group memberships
- **Role Assignment**: Change user roles and permissions
- **Account Status**: Activate, suspend, or ban user accounts

### Financial Operations
- **Transaction Logs**: Complete transaction history with filtering
- **Payment Reports**: Integration status and payment analytics
- **Wallet Sync**: Bulk wallet balance synchronization
- **Failed Transactions**: Monitor and resolve payment issues

### WhatsApp Bot Operations
- **Send Test Messages**: Verify bot functionality
- **Bot Configuration**: View API settings and phone number
- **Feature Management**: Enable/disable bot features
- **Status Monitoring**: Real-time bot health checks

### Database Management
- **Collection Status**: View all Appwrite collections
- **Database Backup**: Create database backups
- **Performance Optimization**: Optimize database performance
- **Usage Statistics**: Monitor storage and API usage

## 🔧 Configuration

### Environment Variables
The admin portal uses the same environment variables as the main application:

```env
# Required for Admin Portal
JWT_SECRET=your-jwt-secret
APPWRITE_ENDPOINT=https://your-appwrite-endpoint/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key

# Optional for Enhanced Features
SELCOM_API_KEY=your_selcom_api_key
GREENAPI_ID_INSTANCE=your_greenapi_instance
GREENAPI_API_TOKEN_INSTANCE=your_greenapi_token
```

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role Verification**: Admin role requirement for all operations
- **Session Management**: Automatic session handling and renewal
- **CORS Protection**: Configured for secure cross-origin requests

## 🛠️ Technical Details

### Technology Stack
- **Frontend**: Vanilla JavaScript with Tailwind CSS
- **Icons**: Lucide Icons for consistent UI elements
- **API**: Axios for HTTP requests
- **Authentication**: JWT tokens with localStorage persistence

### API Integration
- **Appwrite Database**: Direct integration with platform database
- **WhatsApp Bot**: GreenAPI integration for messaging
- **Payment Gateway**: Selcom payment system monitoring
- **Real-time Data**: Live statistics and activity feeds

### Responsive Design
- **Mobile-first**: Optimized for all device sizes
- **Modern UI**: Clean, professional interface design
- **Fast Loading**: Optimized performance and caching

## 📱 Mobile Support

The admin portal is fully responsive and works on:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout for touch interfaces
- **Mobile**: Condensed but complete functionality

## 🔄 Updates & Maintenance

### Automatic Features
- **Real-time Data**: Live updates without page refresh
- **Error Handling**: Graceful error recovery and user feedback
- **Fallback Data**: Demo data when database is unavailable
- **Performance Monitoring**: Built-in performance tracking

### Manual Operations
- **Database Backup**: One-click database backup functionality
- **Wallet Sync**: Manual wallet balance synchronization
- **Bot Restart**: WhatsApp bot restart capabilities
- **System Optimization**: Database optimization tools

## 🆘 Troubleshooting

### Common Issues

1. **Login Failed**
   - Verify super admin credentials
   - Check JWT_SECRET environment variable
   - Ensure server is running

2. **Dashboard Not Loading**
   - Check Appwrite connection
   - Verify API endpoints are accessible
   - Review browser console for errors

3. **WhatsApp Bot Offline**
   - Check GreenAPI credentials
   - Verify bot phone number configuration
   - Test bot status endpoint

### Support
- Check server logs for detailed error messages
- Verify all environment variables are properly set
- Ensure database connection is established

## 📄 License

This admin portal is part of the Kijumbe Rotational Savings Platform and follows the same licensing terms.
