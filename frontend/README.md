# Kijumbe Frontend

A modern React application built with Vite for the Kijumbe Rotational Savings Platform.

## Features

- 🚀 **Vite** - Fast build tool and dev server
- ⚛️ **React 18** - Modern React with hooks
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧭 **React Router** - Client-side routing
- 🔐 **JWT Authentication** - Secure user authentication
- 📱 **Responsive Design** - Mobile-first approach
- 🎯 **Role-based Access** - Different views for different user roles
- 🔔 **Toast Notifications** - User feedback system

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context API

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout wrapper
│   ├── Sidebar.jsx     # Navigation sidebar
│   ├── Header.jsx      # Top header
│   └── ProtectedRoute.jsx # Route protection
├── contexts/           # React contexts
│   ├── AuthContext.jsx # Authentication state
│   └── ToastContext.jsx # Notification system
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── Dashboard.jsx   # User dashboard
│   ├── Groups.jsx      # Groups management
│   ├── Profile.jsx     # User profile
│   ├── admin/          # Admin pages
│   └── kijumbe/        # Kijumbe pages
├── services/           # API services
│   └── api.js          # API client
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_APPWRITE_ENDPOINT=your_endpoint
   VITE_APPWRITE_PROJECT_ID=your_project_id
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Development Server

The development server runs on `http://localhost:3001` and proxies API requests to the backend server running on `http://localhost:3000`.

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for async operations

## User Roles

The application supports different user roles with specific access levels:

### Member
- View personal dashboard
- Join groups
- Make contributions
- View transaction history

### Kiongozi (Group Leader)
- All member features
- Create and manage groups
- Add/remove members
- Send group messages
- View group analytics

### Admin
- All Kiongozi features
- System administration
- User management
- Group oversight
- System statistics

### Super Admin
- Full system access
- All admin features
- System configuration
- Advanced analytics

## API Integration

The frontend communicates with the backend API through the `api.js` service:

```javascript
import { authAPI, groupsAPI, adminAPI } from './services/api'

// Authentication
const loginResult = await authAPI.login(email, password)

// Groups
const groups = await groupsAPI.getMyGroups()

// Admin
const stats = await adminAPI.getStatistics()
```

## Styling

The application uses Tailwind CSS with custom components:

```css
/* Custom component classes */
.btn { /* Button styles */ }
.card { /* Card styles */ }
.input { /* Input styles */ }
```

## Deployment

### Build Process

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

### Environment Variables

Make sure to set the correct environment variables for production:

- `VITE_API_URL` - Backend API URL
- `VITE_APPWRITE_ENDPOINT` - Appwrite endpoint
- `VITE_APPWRITE_PROJECT_ID` - Appwrite project ID

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
