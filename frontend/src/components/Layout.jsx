import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  Home, 
  Users, 
  CreditCard, 
  Receipt, 
  User,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navigationItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      path: '/groups',
      icon: Users,
      label: 'Groups',
      active: location.pathname.startsWith('/groups')
    },
    {
      path: '/transactions',
      icon: Receipt,
      label: 'Transactions',
      active: location.pathname === '/transactions'
    },
    {
      path: '/payments',
      icon: CreditCard,
      label: 'Payments',
      active: location.pathname === '/payments'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      active: location.pathname === '/profile'
    }
  ];

  const adminNavigationItems = [
    {
      path: '/admin/dashboard',
      icon: Home,
      label: 'Dashboard',
      active: location.pathname === '/admin/dashboard'
    },
    {
      path: '/admin/users',
      icon: Users,
      label: 'Users',
      active: location.pathname === '/admin/users'
    },
    {
      path: '/admin/groups',
      icon: Receipt,
      label: 'Groups',
      active: location.pathname === '/admin/groups'
    },
    {
      path: '/whatsapp',
      icon: Bell,
      label: 'WhatsApp',
      active: location.pathname === '/whatsapp'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      active: location.pathname === '/profile'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminRoute = location.pathname.startsWith('/admin');
  const currentNavItems = isAdminRoute ? adminNavigationItems : navigationItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {isAdminRoute ? 'Kijumbe Admin' : 'Kijumbe'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Admin Toggle */}
              {(user?.role === 'admin' || user?.isSuperAdmin) && (
                <button
                  onClick={() => navigate(isAdminRoute ? '/dashboard' : '/admin/dashboard')}
                  className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors"
                >
                  {isAdminRoute ? 'User View' : 'Admin View'}
                </button>
              )}
              
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.isSuperAdmin ? 'Super Admin' : user?.role}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex justify-around">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`bottom-nav-item ${
                  item.active ? 'active' : 'inactive'
                }`}
              >
                {React.createElement(Icon, { className: "h-6 w-6 mb-1" })}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
