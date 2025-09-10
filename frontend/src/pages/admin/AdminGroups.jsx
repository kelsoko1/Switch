import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { adminAPI } from '../../services/api'
import { BarChart3, Search, Filter, MoreVertical, Edit, Trash2, Users, DollarSign } from 'lucide-react'

const AdminGroups = () => {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchGroups()
  }, [currentPage, statusFilter])

  const fetchGroups = async () => {
    try {
      const response = await adminAPI.getGroups(currentPage, 10)
      setGroups(response.data.data.groups)
      setTotalPages(response.data.data.totalPages)
    } catch (err) {
      error('Failed to fetch groups')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (groupId, newStatus) => {
    try {
      await adminAPI.updateGroupStatus(groupId, newStatus)
      success('Group status updated successfully')
      fetchGroups()
    } catch (err) {
      error('Failed to update group status')
    }
  }

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || group.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
            <h1 className="text-2xl font-bold text-gray-900">Groups Management</h1>
            <p className="text-gray-600">Manage savings groups and their settings</p>
          </div>
          <button className="btn btn-primary">
            Create New Group
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-500">ID: {group.id}</p>
              </div>
              <select
                value={group.status}
                onChange={(e) => handleStatusChange(group.id, e.target.value)}
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 ${
                  group.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : group.status === 'inactive'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
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

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
              <button className="btn btn-outline text-sm">
                View Details
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn btn-outline disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-outline disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminGroups
