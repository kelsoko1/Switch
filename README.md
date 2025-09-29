# Switch Platform

A comprehensive platform for managing group finances with real-time communication capabilities, built with modern web technologies.

## 🌟 Features

- 💰 **Wallet & Transactions**: Send, receive, and manage funds
- 💬 **Real-time Chat**: XMPP-based messaging system
- 📹 **Video Streaming**: Integrated Janus WebRTC for video calls
- 🔒 **Secure Authentication**: JWT-based authentication
- 📱 **Mobile Responsive**: Works on all devices
- 🚀 **Scalable Architecture**: Built with microservices in mind

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or later
- npm 8.0.0 or later
- PostgreSQL 14.0 or later
- Redis 6.0 or later
- Server with public IP (e.g., 93.127.203.151)
- Domain name (optional, but recommended)
- SSL certificates (Let's Encrypt recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/switch.git
cd switch
```

### 2. Set Up Environment Variables

```bash
# Copy example environment files
cp .env.example .env
cp server/.env.example server/.env
cp env.production.template .env.production

# Edit the files with your configuration
nano .env
nano server/.env
nano .env.production
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 4. Build the Application

```bash
# Build the frontend
npm run build

# Build the server
cd server
npm run build
cd ..
```

### 5. Start the Application

```bash
# Start the server in production mode
cd server
npm run start:prod

# In a new terminal, start the frontend
npm run preview
```

### 6. Access the Application

Open your browser and navigate to:
```
https://93.127.203.151:2025
```

### 7. Set Up Systemd Services (Optional for Production)

For production deployments, it's recommended to set up systemd services to manage the application processes. Example service files are provided in the `scripts` directory.

- Frontend: https://93.127.203.151:2025
- Admin Panel: https://93.127.203.151:2025/admin
- API Documentation: https://93.127.203.151:2025/api/docs

## 🛠 Management Commands

Use the `manage.sh` script to manage the application:

```bash
# Start the application
./manage.sh start

# Stop the application
./manage.sh stop

# View logs
./manage.sh logs

# Create a backup
./manage.sh backup

# Update the application
./manage.sh update
```

## 🔧 Environment Variables

Key environment variables that need to be configured:

```
# Server Configuration
NODE_ENV=production
PORT=2025
HOST=0.0.0.0
FRONTEND_URL=https://93.127.203.151:2025

# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_API_KEY=your_api_key

# XMPP/Janus Configuration
XMPP_SERVER=wss://93.127.203.151:2025:2026/ws
XMPP_DOMAIN=93.127.203.151:2025
EJABBERD_WS_URL=wss://93.127.203.151:2025:2026/ws
EJABBERD_DOMAIN=93.127.203.151:2025
EJABBERD_API_URL=https://93.127.203.151:2025:2026/api
USE_JANUS=true
JANUS_URL=wss://93.127.203.151:2025:8188
JANUS_JS_URL=https://93.127.203.151:2025:8088/janus.js
```

## 📂 Project Structure

```
switch/
├── .github/               # GitHub workflows and templates
├── nginx/                 # Nginx configuration
│   └── conf.d/            # Nginx server blocks
│       └── default.conf   # Main Nginx configuration
├── public/                # Static files
├── server/                # Backend server
│   ├── src/               # Source code
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic
│   └── package.json      # Server dependencies
├── src/                   # Frontend source code
├── .dockerignore         # Docker ignore file
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker configuration
└── package.json          # Project dependencies
```

## 🔒 Security

- All traffic is encrypted with TLS 1.2/1.3
- Secure HTTP headers enabled
- Rate limiting on API endpoints
- CSRF protection
- XSS protection
- Content Security Policy (CSP) in place

## 📚 Documentation

- [API Documentation](https://93.127.203.151:2025/api/docs)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Appwrite](https://appwrite.io/) - Backend as a Service
- [ejabberd](https://www.ejabberd.im/) - XMPP Server
- [Janus](https://janus.conf.meetecho.com/) - WebRTC Server
- [React](https://reactjs.org/) - Frontend Library
- [Node.js](https://nodejs.org/) - JavaScript Runtime
│   └── index.js            # Server entry point
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── ...
├── .env                   # Frontend environment variables
└── package.json           # Project configuration
```

## Setting Up Appwrite

1. Create a new project in Appwrite
2. Set up the following collections with the appropriate permissions:
   - `wallets`: For storing user wallet information
   - `transactions`: For recording all transactions
   - `users`: For storing user information

## Setting Up WhatsApp Bot

1. Sign up for Green API (or your preferred WhatsApp Business API provider)
2. Get your instance ID and API token
3. Configure the webhook URL to point to your server's WhatsApp webhook endpoint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
