import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { adminAPI, api } from '../../services/api'
import { Users, BarChart3, DollarSign, TrendingUp, Activity, Shield, MessageSquare, Wifi, WifiOff } from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const { error } = useToast()
  const [statistics, setStatistics] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [whatsappStats, setWhatsappStats] = useState({
    status: 'disconnected',
    totalMessages: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse, whatsappResponse] = await Promise.all([
        adminAPI.getStatistics(),
        adminAPI.getRecentActivity(),
        api.get('/whatsapp/status').catch(() => ({ data: { success: false } }))
      ])
      
      setStatistics(statsResponse.data.data.statistics)
      setRecentActivity(activityResponse.data.data.activities)
      
      if (whatsappResponse.data.success) {
        setWhatsappStats({
          status: whatsappResponse.data.data.status,
          totalMessages: whatsappResponse.data.data.stats?.totalMessages || 0,
          activeUsers: whatsappResponse.data.data.stats?.activeUsers || 0
        })
      }
    } catch (err) {
      error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Users',
      value: statistics?.users?.total || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Groups',
      value: statistics?.groups?.active || 0,
      change: '+8%',
      changeType: 'positive',
      icon: BarChart3,
      color: 'bg-green-500'
    },
    {
      name: 'Total Transactions',
      value: statistics?.transactions?.total || 0,
      change: '+23%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      name: 'Transaction Volume',
      value: `${(statistics?.transactions?.total_amount || 0).toLocaleString()} TZS`,
      change: '+15%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      name: 'WhatsApp Messages',
      value: whatsappStats.totalMessages,
      change: whatsappStats.status === 'connected' ? 'Active' : 'Offline',
      changeType: whatsappStats.status === 'connected' ? 'positive' : 'negative',
      icon: MessageSquare,
      color: whatsappStats.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-500">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">System overview and administration</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* WhatsApp Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            WhatsApp Bot Status
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
            whatsappStats.status === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {whatsappStats.status === 'connected' ? (
              <Wifi className="h-4 w-4 mr-1" />
            ) : (
              <WifiOff className="h-4 w-4 mr-1" />
            )}
            {whatsappStats.status === 'connected' ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{whatsappStats.totalMessages}</div>
            <div className="text-sm text-gray-500">Total Messages</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{whatsappStats.activeUsers}</div>
            <div className="text-sm text-gray-500">Active Users</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">255738071080</div>
            <div className="text-sm text-gray-500">Bot Number</div>
          </div>
        </div>
        
        <div className="mt-4">
          <a 
            href="/admin/whatsapp" 
            className="btn btn-primary"
          >
            Manage WhatsApp Bot
          </a>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Users</span>
              <span className="text-sm font-semibold text-gray-900">
                {statistics?.users?.total || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Active Users</span>
              <span className="text-sm font-semibold text-gray-900">
                {statistics?.users?.active || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Inactive Users</span>
              <span className="text-sm font-semibold text-gray-900">
                {statistics?.users?.inactive || 0}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ 
                  width: `${statistics?.users?.total > 0 ? (statistics.users.active / statistics.users.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {statistics?.users?.total > 0 ? Math.round((statistics.users.active / statistics.users.total) * 100) : 0}% active users
            </p>
          </div>
        </div>

        {/* Group Statistics */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Group Statistics</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Groups</span>
              <span className="text-sm font-semibold text-gray-900">
                {statistics?.groups?.total || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Active Groups</span>
              <span className="text-sm font-semibold text-gray-900">
                {statistics?.groups?.active || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Inactive Groups</span>
              <span className="text-sm font-semibold text-gray-900">
                {statistics?.groups?.inactive || 0}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ 
                  width: `${statistics?.groups?.total > 0 ? (statistics.groups.active / statistics.groups.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {statistics?.groups?.total > 0 ? Math.round((statistics.groups.active / statistics.groups.total) * 100) : 0}% active groups
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="btn btn-outline">
            View All
          </button>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500">
              Activity will appear here as users interact with the system.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
