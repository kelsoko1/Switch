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
  Eye,
  Send,
  UserCheck,
  Crown,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

const GroupPaymentsTab = () => {
  const { user, isKiongozi } = useAuth()
  const { formatCurrency, formatDate } = useWallet()
  const [groups, setGroups] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    fetchGroups()
    fetchPayments()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getMyGroups()
      setGroups(response.data.data.groups)
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      // This would be a new API endpoint for fetching group payments
      // const response = await walletAPI.getGroupPayments()
      // setPayments(response.data.data.payments)
      
      // Mock data for now
      setPayments([
        {
          id: 1,
          group_id: 1,
          group_name: "Family Savings",
          recipient_id: "user_123",
          recipient_name: "John Doe",
          amount: 50000,
          rotation_number: 1,
          status: "completed",
          created_at: "2024-01-15T10:00:00Z",
          completed_at: "2024-01-15T10:30:00Z",
          type: "rotation_payment"
        },
        {
          id: 2,
          group_id: 1,
          group_name: "Family Savings",
          recipient_id: "user_456",
          recipient_name: "Jane Smith",
          amount: 50000,
          rotation_number: 2,
          status: "pending",
          created_at: "2024-02-15T10:00:00Z",
          type: "rotation_payment"
        }
      ])
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayment = async (paymentId) => {
    try {
      // This would be a new API endpoint for processing payments
      // await walletAPI.processGroupPayment(paymentId)
      fetchPayments()
    } catch (error) {
      console.error('Failed to process payment:', error)
    }
  }

  const getPaymentStatus = (payment) => {
    switch (payment.status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' }
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' }
      case 'failed':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' }
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown' }
    }
  }

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'rotation_payment':
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      case 'contribution':
        return <DollarSign className="h-5 w-5 text-green-600" />
      case 'penalty':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />
    }
  }

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'rotation_payment':
        return 'Rotation Payment'
      case 'contribution':
        return 'Contribution'
      case 'penalty':
        return 'Penalty'
      default:
        return 'Payment'
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
          <h3 className="text-lg font-medium text-gray-900">Group Payments</h3>
          <p className="text-sm text-gray-500">
            {isKiongozi() 
              ? 'Manage payments and distributions for your groups' 
              : 'View your group payment history and status'
            }
          </p>
        </div>
        {isKiongozi() && groups.length > 0 && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Process Payment
          </button>
        )}
      </div>

      {/* Kiongozi-specific features */}
      {isKiongozi() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{group.name}</h4>
                  <p className="text-sm text-gray-500">Your Group</p>
                </div>
                <Crown className="h-5 w-5 text-yellow-500" />
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
                  Manage Payments
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isKiongozi() ? 'Payment Management' : 'Payment History'}
          </h3>
        </div>
        
        {payments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {payments.map((payment) => {
              const statusDisplay = getPaymentStatus(payment)
              const StatusIcon = statusDisplay.icon
              
              return (
                <div key={payment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getPaymentTypeIcon(payment.type)}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {getPaymentTypeLabel(payment.type)} - {payment.group_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.type === 'rotation_payment' 
                            ? `Rotation #${payment.rotation_number} - ${payment.recipient_name}`
                            : payment.description || 'Group payment'
                          }
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusDisplay.label}
                        </span>
                      </div>
                      
                      {isKiongozi() && payment.status === 'pending' && (
                        <button
                          onClick={() => handleProcessPayment(payment.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Process
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isKiongozi() 
                ? 'Start processing payments for your groups.'
                : 'Your group payment history will appear here.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Payment Statistics */}
      {isKiongozi() && payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Processed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(
                    payments
                      .filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {payments.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Payment Modal */}
      {showPaymentModal && (
        <ProcessPaymentModal
          groups={groups}
          onClose={() => setShowPaymentModal(false)}
          onProcess={handleProcessPayment}
        />
      )}

      {/* Group Details Modal */}
      {selectedGroup && (
        <GroupPaymentDetailsModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  )
}

// Process Payment Modal Component
const ProcessPaymentModal = ({ groups, onClose, onProcess }) => {
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedGroup || !selectedMember || !amount) return

    setLoading(true)
    try {
      await onProcess({
        group_id: selectedGroup,
        recipient_id: selectedMember,
        amount: parseFloat(amount)
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedGroupData = groups.find(g => g.id === selectedGroup)

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Process Payment</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value)
                  setSelectedMember('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Member
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!selectedGroup}
              >
                <option value="">Choose a member</option>
                {selectedGroupData?.members?.map((member) => (
                  <option key={member.id} value={member.user_id}>
                    {member.user?.name} - Member #{member.member_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (TZS)
              </label>
              <input
                type="number"
                min="1000"
                step="100"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                disabled={loading || !selectedGroup || !selectedMember || !amount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Process Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Group Payment Details Modal Component
const GroupPaymentDetailsModal = ({ group, onClose }) => {
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
                <span className="text-sm text-gray-600">Current Rotation</span>
                <span className="text-sm font-medium text-gray-900">
                  #{group.current_rotation}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-medium text-gray-900">
                  {group.rotation_duration} months
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupPaymentsTab
