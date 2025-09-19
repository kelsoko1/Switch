# Switch Application

A modern web application with wallet functionality and WhatsApp integration.

## Features

- 💰 Wallet functionality (send, receive, check balance)
- 📱 WhatsApp bot integration
- 🔒 Secure authentication with JWT
- 🚀 Built with React, Vite, and Node.js
- 🗄️ Backed by Appwrite

## Prerequisites

- Node.js 16+ and npm 8+
- Appwrite instance (local or cloud)
- WhatsApp Business API access (Green API or similar)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd switch
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` in the root directory
   - Copy `server/.env.example` to `server/.env`
   - Update the environment variables with your configuration

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately
   # Frontend only
   npm run dev:frontend
   # Backend only (from project root)
   npm run dev:backend
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

### Frontend (`.env`)
```
VITE_APP_API_URL=http://localhost:5000
VITE_APP_APPWRITE_ENDPOINT=your_appwrite_endpoint
VITE_APP_APPWRITE_PROJECT_ID=your_project_id
```

### Backend (`server/.env`)
```
PORT=5000
NODE_ENV=development

# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=kijumbe_wallet
APPWRITE_WALLET_COLLECTION_ID=wallets
APPWRITE_TRANSACTION_COLLECTION_ID=transactions
APPWRITE_USERS_COLLECTION_ID=users

# WhatsApp Green API Configuration
GREEN_API_INSTANCE_ID=your_instance_id
GREEN_API_TOKEN=your_api_token

# Session Secret (generate a strong secret for production)
SESSION_SECRET=your_session_secret
```

## Project Structure

```
switch/
├── public/                  # Static files
├── server/                  # Backend server
│   ├── middleware/          # Express middleware
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── .env                # Server environment variables
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
