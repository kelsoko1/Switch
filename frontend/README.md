# Kijumbe Frontend

## 🚀 Project Overview
Kijumbe is a rotational savings platform with WhatsApp integration, built for the Tanzanian market.

## 📋 Prerequisites
- Node.js 18.0.0+
- npm 9.0.0+

## 🔧 Setup and Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd kijumbe/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
1. Copy the `.env.example` to `.env`
2. Fill in your specific configuration details

### 4. Development Server
```bash
npm run dev
```
- Frontend will run on `http://localhost:3001`

### 5. Production Build
```bash
npm run build
```
- Builds the app for production in the `build` folder

## 🛠️ Available Scripts
- `npm run dev`: Starts the development server
- `npm run build`: Builds the app for production
- `npm run preview`: Serves the production build locally
- `npm run lint`: Runs the linter

## 📦 Key Dependencies
- React 18.2.0
- React Router 6.22.3
- Vite 5.2.8
- Tailwind CSS 3.4.1

## 🔒 Environment Variables
Ensure the following variables are set in your `.env`:
- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- Other service-specific configurations

## 🚧 Troubleshooting
- Ensure Node.js and npm versions match prerequisites
- Clear npm cache if dependency issues occur: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📄 License
MIT License
