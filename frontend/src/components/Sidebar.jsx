import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Home,
  Users,
  UserCheck,
  Settings,
  Shield,
  BarChart3,
  MessageSquare,
  LogOut,
  Wallet
} from 'lucide-react'

const Sidebar = () => {
  const { user, logout, isAdmin, isKiongozi } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Groups', href: '/groups', icon: Users },
    { name: 'Savings Wallet', href: '/wallet', icon: Wallet },
    { name: 'Profile', href: '/profile', icon: UserCheck },
  ]

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Groups', href: '/admin/groups', icon: BarChart3 },
    { name: 'WhatsApp', href: '/admin/whatsapp', icon: MessageSquare },
  ]

  const kijumbeNavigation = [
    { name: 'Kijumbe Dashboard', href: '/kijumbe', icon: BarChart3 },
    { name: 'My Groups', href: '/kijumbe/groups', icon: Users },
    { name: 'Members', href: '/kijumbe/users', icon: UserCheck },
  ]

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-primary-600">Kijumbe</h1>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {/* Main Navigation - All users see this */}
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              )
            })}

            {/* Kijumbe Navigation */}
            {(isKiongozi() || user?.isSuperAdmin) && (
              <>
                <div className="border-t border-gray-200 my-4"></div>
                <div className="px-2 py-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kijumbe
                  </h3>
                </div>
                {kijumbeNavigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  )
                })}
              </>
            )}

            {/* Admin Navigation */}
            {(isAdmin() || user?.isSuperAdmin) && (
              <>
                <div className="border-t border-gray-200 my-4"></div>
                <div className="px-2 py-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administration
                  </h3>
                </div>
                {adminNavigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  )
                })}
              </>
            )}
          </nav>
        </div>
        
        {/* User Info & Logout */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <div className="flex items-center space-x-1">
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                {user?.isSuperAdmin && (
                  <span className="text-xs text-red-600 font-bold">🔥</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="ml-auto p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
