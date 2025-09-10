import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { groupsAPI } from '../services/api'
import { Users, TrendingUp, DollarSign, Calendar } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const { error } = useToast()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getMyGroups()
      setGroups(response.data.data.groups)
    } catch (err) {
      error('Failed to fetch groups')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      name: 'Total Groups',
      value: groups.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Groups',
      value: groups.filter(g => g.status === 'active').length,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      name: 'Total Contributions',
      value: groups.reduce((sum, g) => sum + (g.contribution_amount || 0), 0).toLocaleString(),
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      name: 'This Month',
      value: new Date().toLocaleDateString('en-US', { month: 'long' }),
      icon: Calendar,
      color: 'bg-purple-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your savings groups and activities.
        </p>
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Groups */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Groups</h2>
          <button className="btn btn-primary">
            Create New Group
          </button>
        </div>
        
        {groups.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No groups yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new savings group or joining an existing one.
            </p>
            <div className="mt-6">
              <button className="btn btn-primary">
                Create Group
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500">
                      {group.current_members} of {group.max_members} members
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {group.contribution_amount?.toLocaleString()} TZS
                    </p>
                    <p className="text-sm text-gray-500">
                      {group.role === 'kiongozi' ? 'Leader' : 'Member'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    group.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {group.status}
                  </span>
                  <button className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
