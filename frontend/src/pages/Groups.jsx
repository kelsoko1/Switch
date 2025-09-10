import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { groupsAPI } from '../services/api'
import { Plus, Users, DollarSign, Calendar, Eye } from 'lucide-react'

const Groups = () => {
  const { user, isKiongozi } = useAuth()
  const { error } = useToast()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600">Manage your savings groups</p>
        </div>
        {isKiongozi() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Group</span>
          </button>
        )}
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No groups yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isKiongozi() 
              ? 'Create your first savings group to get started.'
              : 'You haven\'t joined any groups yet.'
            }
          </p>
          {isKiongozi() && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                Create Your First Group
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">
                    {group.role === 'kiongozi' ? 'You are the leader' : 'You are a member'}
                  </p>
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

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="btn btn-outline w-full flex items-center justify-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchGroups()
          }}
        />
      )}
    </div>
  )
}

// Create Group Modal Component
const CreateGroupModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    max_members: 10,
    rotation_duration: 6,
    contribution_amount: 50000
  })
  const { success, error } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await groupsAPI.create(formData)
      success('Group created successfully!')
      onSuccess()
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Group</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Group Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="Enter group name"
                required
              />
            </div>

            <div>
              <label className="label">Maximum Members</label>
              <input
                type="number"
                name="max_members"
                value={formData.max_members}
                onChange={handleChange}
                className="input"
                min="2"
                max="50"
                required
              />
            </div>

            <div>
              <label className="label">Rotation Duration (months)</label>
              <input
                type="number"
                name="rotation_duration"
                value={formData.rotation_duration}
                onChange={handleChange}
                className="input"
                min="1"
                max="12"
                required
              />
            </div>

            <div>
              <label className="label">Contribution Amount (TZS)</label>
              <input
                type="number"
                name="contribution_amount"
                value={formData.contribution_amount}
                onChange={handleChange}
                className="input"
                min="1000"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Groups
