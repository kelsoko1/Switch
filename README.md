# Kijumbe Rotational Savings Platform

## 🌍 Project Overview
Kijumbe is a comprehensive rotational savings platform designed for the Tanzanian market, featuring WhatsApp integration and robust financial management tools.

## 🚀 Key Features
- Rotational Savings Management
- WhatsApp Integration
- User Role Management
- Payment Processing
- Group Savings Tracking

## 📋 Prerequisites
- Node.js 18.0.0+
- npm 9.0.0+
- Appwrite Cloud Account

## 🔧 Project Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd kijumbe
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Environment Configuration
1. Copy `env.example` to `.env`
2. Fill in all required credentials:
   - Appwrite credentials
   - JWT Secret
   - Payment Gateway Keys
   - WhatsApp API Credentials

### 4. Development Servers
- Frontend: `npm run dev` (Port 3001)
- Backend: `npm run start:dev` (Port 3000)

### 5. Production Build
```bash
npm run build-and-start
```

## 📂 Project Structure
- `frontend/`: React frontend application
- `backend/`: Express backend server
- `config/`: Configuration files
- `routes/`: API endpoint definitions
- `services/`: Core business logic

## 🛠️ Key Technologies
- Frontend: React 18, Vite, Tailwind CSS
- Backend: Express.js, Node.js
- Database: Appwrite
- Authentication: JWT
- WhatsApp Integration: GreenAPI

## 🔒 Security Features
- JWT Authentication
- Role-based Access Control
- Rate Limiting
- Input Validation

## 🚧 Troubleshooting
- Check `PRODUCTION_SETUP.md` for detailed deployment instructions
- Verify all environment variables are correctly set
- Ensure compatible Node.js and npm versions

## 📄 License
MIT License

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support
For support, please:
- Check the documentation
- Review server logs
- Open an issue on GitHub
