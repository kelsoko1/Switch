import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, Video, Wallet, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { icon: MessageSquare, label: 'Chats', path: '/' },
    { icon: Video, label: 'Streams', path: '/streams' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },

    { icon: Settings, label: 'Settings', path: '/settings' },
  ];



  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-primary-500">Switch</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Log Out</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Page Content */}
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="h-16 bg-white border-t grid grid-cols-4 items-center">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 text-xs',
                isActive
                  ? 'text-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              )
            }
          >
            <Icon className="w-6 h-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default MainLayout;