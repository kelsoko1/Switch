import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { groupsAPI } from '../../services/api'
import { BarChart3, Users, DollarSign, Calendar, Eye, Edit, Trash2, Plus } from 'lucide-react'

const KijumbeGroups = () => {
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
      const myGroups = response.data.data.groups.filter(g => g.role === 'kiongozi')
      setGroups(myGroups)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
            <p className="text-gray-600">Manage your savings groups as a Kiongozi</p>
          </div>
          <button className="btn btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="card text-center py-12">
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
          {groups.map((group) => (
            <div key={group.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">ID: {group.id}</p>
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
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Duration</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {group.rotation_duration} months
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                <button className="btn btn-outline text-sm flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                <div className="flex space-x-2">
                  <button className="text-primary-600 hover:text-primary-900">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default KijumbeGroups
