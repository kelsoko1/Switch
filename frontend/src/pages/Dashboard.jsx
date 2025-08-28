import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowRight,
  Crown,
  Shield,
  Database
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.name || 'Administrator'}!
        </h1>
          <p className="mt-2 text-gray-600">
            Welcome to your Kijumbe Superadmin Dashboard
        </p>
      </div>

      {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Groups</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
        </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-600" />
        </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-2xl font-semibold text-gray-900 capitalize">
                  {user?.role || 'Superadmin'}
              </p>
            </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin/dashboard"
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
          <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-medium text-gray-900">Admin Panel</h3>
                <p className="text-sm text-gray-600 mt-1">Manage system settings</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600 mt-1">Manage system users</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

              <Link
            to="/admin/groups"
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Group Management</h3>
                <p className="text-sm text-gray-600 mt-1">Manage savings groups</p>
                  </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            
            <Link
            to="/whatsapp"
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">WhatsApp</h3>
                <p className="text-sm text-gray-600 mt-1">Manage notifications</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            </Link>

            <Link
            to="/profile"
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                <p className="text-sm text-gray-600 mt-1">Update your profile</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
          </Link>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">System Status</h3>
                <p className="text-sm opacity-90 mt-1">All systems operational</p>
              </div>
              <Shield className="w-5 h-5 opacity-90" />
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Backend</p>
                <p className="text-sm text-gray-600">Running on port 3000</p>
              </div>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Authentication</p>
                <p className="text-sm text-gray-600">Local system active</p>
              </div>
          </div>
            <div className="flex items-center">
              <Crown className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Access Level</p>
                <p className="text-sm text-gray-600">Full system control</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
