# Kijumbe Rotational Savings Platform

A modern Node.js application for managing rotational savings groups with WhatsApp integration and Appwrite backend.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 👥 **Group Management** - Create and manage rotational savings groups
- 📱 **WhatsApp Integration** - Automated messaging via GreenAPI
- 🗄️ **Appwrite Backend** - Cloud database and authentication
- 🛡️ **Security** - Helmet, CORS, input validation
- 📊 **Admin Dashboard** - System statistics and user management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Appwrite Cloud
- **Authentication**: JWT tokens
- **WhatsApp**: GreenAPI Business API
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: express-validator

## Project Structure

```
src/
├── config/          # Configuration files
│   └── appwrite.js  # Appwrite client setup
├── middleware/      # Express middleware
│   ├── auth.js      # Authentication & authorization
│   └── errorHandler.js # Global error handling
├── routes/          # API routes
│   ├── auth.js      # Authentication routes
│   ├── groups.js    # Group management routes
│   ├── whatsapp.js  # WhatsApp integration routes
│   └── admin.js     # Admin panel routes
├── services/        # Business logic
│   └── whatsapp-bot.js # WhatsApp bot service
└── server.js        # Main application entry point
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kijumbe-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - Appwrite project credentials
   - WhatsApp GreenAPI credentials
   - JWT secret key

4. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

### Required
- `APPWRITE_ENDPOINT` - Your Appwrite endpoint
- `APPWRITE_PROJECT_ID` - Your Appwrite project ID
- `APPWRITE_API_KEY` - Your Appwrite API key
- `JWT_SECRET` - Secret key for JWT tokens

### WhatsApp (Optional)
- `GREENAPI_ID_INSTANCE` - GreenAPI instance ID
- `GREENAPI_API_TOKEN_INSTANCE` - GreenAPI API token
- `GREENAPI_BOT_PHONE` - Bot phone number

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Groups
- `POST /api/groups/create` - Create savings group (Kiongozi)
- `GET /api/groups/my-groups` - Get user's groups
- `GET /api/groups/:id` - Get group details

### WhatsApp
- `POST /api/whatsapp/webhook` - WhatsApp webhook
- `GET /api/whatsapp/status` - Bot status
- `POST /api/whatsapp/send` - Send message (Admin)

### Admin
- `GET /api/admin/statistics` - System statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/groups` - Get all groups

## User Roles

- **Member** - Can join groups and make contributions
- **Kiongozi** - Can create and manage groups
- **Admin** - Full system access
- **SuperAdmin** - System administration

## WhatsApp Bot Commands

- `hi`, `hello`, `hujambo` - Welcome message
- `kiongozi` - Kiongozi role selection
- `mwanachama` - Member role selection
- `msaada`, `help` - Help information

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented yet)

### Code Style
- Use ES6+ features
- Follow RESTful API conventions
- Implement proper error handling
- Add input validation for all endpoints

## Deployment

1. Set up your Appwrite project
2. Configure environment variables
3. Set up WhatsApp GreenAPI instance
4. Deploy to your preferred platform (Heroku, DigitalOcean, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@kijumbe.com or create an issue in the repository.