import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useWallet } from '../../contexts/WalletContext'
import { groupsAPI } from '../../services/api'
import { 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  TrendingUp
} from 'lucide-react'

const ContributionsTab = () => {
  const { user } = useAuth()
  const { formatCurrency, formatDate } = useWallet()
  const [groups, setGroups] = useState([])
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showContributeModal, setShowContributeModal] = useState(false)

  useEffect(() => {
    fetchGroups()
    fetchContributions()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getMyGroups()
      setGroups(response.data.data.groups)
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    }
  }

  const fetchContributions = async () => {
    try {
      // This would be a new API endpoint for fetching user contributions
      // const response = await walletAPI.getContributions()
      // setContributions(response.data.data.contributions)
    } catch (error) {
      console.error('Failed to fetch contributions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContribute = async (groupId, amount) => {
    try {
      // This would be a new API endpoint for making contributions
      // await walletAPI.contributeToGroup(groupId, amount)
      setShowContributeModal(false)
      fetchContributions()
    } catch (error) {
      console.error('Failed to make contribution:', error)
    }
  }

  const getContributionStatus = (contribution) => {
    if (contribution.status === 'completed') {
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Paid' }
    } else if (contribution.status === 'pending') {
      return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' }
    } else {
      return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Overdue' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Group Contributions</h3>
          <p className="text-sm text-gray-500">Manage your savings group contributions</p>
        </div>
        {groups.length > 0 && (
          <button
            onClick={() => setShowContributeModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Make Contribution
          </button>
        )}
      </div>

      {/* Groups Overview */}
      {groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{group.name}</h4>
                  <p className="text-sm text-gray-500">
                    {group.role === 'kiongozi' ? 'Leader' : 'Member'}
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
                    {formatCurrency(group.contribution_amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Rotation</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    #{group.current_rotation}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setSelectedGroup(group)}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Groups Message */}
      {groups.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't joined any savings groups yet.
          </p>
        </div>
      )}

      {/* Recent Contributions */}
      {contributions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Contributions</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {contributions.map((contribution) => {
              const statusDisplay = getContributionStatus(contribution)
              const StatusIcon = statusDisplay.icon
              
              return (
                <div key={contribution.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <StatusIcon className={`h-5 w-5 ${statusDisplay.color}`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {contribution.group_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rotation #{contribution.rotation_number}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(contribution.due_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(contribution.amount)}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                        {statusDisplay.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {showContributeModal && (
        <ContributeModal
          groups={groups}
          onClose={() => setShowContributeModal(false)}
          onContribute={handleContribute}
        />
      )}

      {/* Group Details Modal */}
      {selectedGroup && (
        <GroupDetailsModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  )
}

// Contribute Modal Component
const ContributeModal = ({ groups, onClose, onContribute }) => {
  const [selectedGroup, setSelectedGroup] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedGroup || !amount) return

    setLoading(true)
    try {
      await onContribute(selectedGroup, parseFloat(amount))
    } finally {
      setLoading(false)
    }
  }

  const selectedGroupData = groups.find(g => g.id === selectedGroup)

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Make Contribution</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} - {group.contribution_amount?.toLocaleString()} TZS
                  </option>
                ))}
              </select>
            </div>

            {selectedGroupData && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Group Details</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>Required amount: {selectedGroupData.contribution_amount?.toLocaleString()} TZS</p>
                  <p>Current rotation: #{selectedGroupData.current_rotation}</p>
                  <p>Members: {selectedGroupData.current_members}/{selectedGroupData.max_members}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (TZS)
              </label>
              <input
                type="number"
                min={selectedGroupData?.contribution_amount || 0}
                step="100"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {selectedGroupData && (
                <p className="text-sm text-gray-500 mt-1">
                  Minimum: {selectedGroupData.contribution_amount?.toLocaleString()} TZS
                </p>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedGroup || !amount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Make Contribution'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Group Details Modal Component
const GroupDetailsModal = ({ group, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Contribution</p>
                <p className="text-lg font-semibold text-gray-900">
                  {group.contribution_amount?.toLocaleString()} TZS
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-lg font-semibold text-gray-900">
                  {group.current_members}/{group.max_members}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-medium text-gray-900">
                  {group.rotation_duration} months
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Rotation</span>
                <span className="text-sm font-medium text-gray-900">
                  #{group.current_rotation}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  group.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {group.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContributionsTab
