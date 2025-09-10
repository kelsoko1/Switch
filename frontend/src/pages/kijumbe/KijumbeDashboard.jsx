import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { groupsAPI } from '../../services/api'
import { Users, BarChart3, DollarSign, TrendingUp, Plus, MessageSquare } from 'lucide-react'

const KijumbeDashboard = () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const myGroups = groups.filter(g => g.role === 'kiongozi')
  const totalMembers = myGroups.reduce((sum, g) => sum + g.current_members, 0)
  const totalContributions = myGroups.reduce((sum, g) => sum + (g.contribution_amount * g.current_members), 0)

  const stats = [
    {
      name: 'My Groups',
      value: myGroups.length,
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Members',
      value: totalMembers,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      name: 'Total Contributions',
      value: `${totalContributions.toLocaleString()} TZS`,
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      name: 'Active Groups',
      value: myGroups.filter(g => g.status === 'active').length,
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kijumbe Dashboard</h1>
            <p className="text-gray-600">Manage your savings groups as a Kiongozi</p>
          </div>
          <div className="flex space-x-3">
            <button className="btn btn-outline flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Send Message</span>
            </button>
            <button className="btn btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Group</span>
            </button>
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* My Groups */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">My Groups</h2>
          <button className="btn btn-primary">
            Create New Group
          </button>
        </div>
        
        {myGroups.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No groups yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first savings group to start managing members and contributions.
            </p>
            <div className="mt-6">
              <button className="btn btn-primary">
                Create Your First Group
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500">Group ID: {group.id}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    group.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {group.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Members</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {group.current_members}/{group.max_members}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Contribution</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {group.contribution_amount?.toLocaleString()} TZS
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Duration</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {group.rotation_duration} months
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="btn btn-outline w-full">
                    Manage Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Add Members</h3>
                <p className="text-xs text-gray-500">Invite new members to your groups</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Send Messages</h3>
                <p className="text-xs text-gray-500">Communicate with group members</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">View Reports</h3>
                <p className="text-xs text-gray-500">Check group performance and analytics</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default KijumbeDashboard
