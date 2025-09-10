import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useWallet } from '../../contexts/WalletContext'
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react'

const SavingsGoalsTab = () => {
  const { user } = useAuth()
  const { formatCurrency, formatDate } = useWallet()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  useEffect(() => {
    fetchSavingsGoals()
  }, [])

  const fetchSavingsGoals = async () => {
    try {
      // This would be a new API endpoint for fetching savings goals
      // const response = await walletAPI.getSavingsGoals()
      // setGoals(response.data.data.goals)
      
      // Mock data for now
      setGoals([
        {
          id: 1,
          name: "Emergency Fund",
          target_amount: 500000,
          current_amount: 150000,
          target_date: "2024-12-31",
          status: "active",
          created_at: "2024-01-01",
          description: "Build emergency fund for unexpected expenses"
        },
        {
          id: 2,
          name: "New Phone",
          target_amount: 300000,
          current_amount: 300000,
          target_date: "2024-06-30",
          status: "completed",
          created_at: "2024-01-15",
          description: "Save for a new smartphone"
        }
      ])
    } catch (error) {
      console.error('Failed to fetch savings goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (goalData) => {
    try {
      // This would be a new API endpoint for creating savings goals
      // await walletAPI.createSavingsGoal(goalData)
      setShowCreateModal(false)
      fetchSavingsGoals()
    } catch (error) {
      console.error('Failed to create savings goal:', error)
    }
  }

  const handleUpdateGoal = async (goalId, goalData) => {
    try {
      // This would be a new API endpoint for updating savings goals
      // await walletAPI.updateSavingsGoal(goalId, goalData)
      setEditingGoal(null)
      fetchSavingsGoals()
    } catch (error) {
      console.error('Failed to update savings goal:', error)
    }
  }

  const handleDeleteGoal = async (goalId) => {
    try {
      // This would be a new API endpoint for deleting savings goals
      // await walletAPI.deleteSavingsGoal(goalId)
      fetchSavingsGoals()
    } catch (error) {
      console.error('Failed to delete savings goal:', error)
    }
  }

  const getGoalStatus = (goal) => {
    const now = new Date()
    const targetDate = new Date(goal.target_date)
    const progress = (goal.current_amount / goal.target_amount) * 100

    if (goal.status === 'completed' || progress >= 100) {
      return { 
        icon: CheckCircle, 
        color: 'text-green-600', 
        bg: 'bg-green-100', 
        label: 'Completed',
        progress: 100
      }
    } else if (targetDate < now && progress < 100) {
      return { 
        icon: AlertCircle, 
        color: 'text-red-600', 
        bg: 'bg-red-100', 
        label: 'Overdue',
        progress: progress
      }
    } else if (targetDate < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
      return { 
        icon: Clock, 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-100', 
        label: 'Due Soon',
        progress: progress
      }
    } else {
      return { 
        icon: TrendingUp, 
        color: 'text-blue-600', 
        bg: 'bg-blue-100', 
        label: 'On Track',
        progress: progress
      }
    }
  }

  const getDaysRemaining = (targetDate) => {
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = target - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
          <h3 className="text-lg font-medium text-gray-900">Savings Goals</h3>
          <p className="text-sm text-gray-500">Track and manage your personal savings targets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </button>
      </div>

      {/* Goals Overview */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const statusDisplay = getGoalStatus(goal)
            const StatusIcon = statusDisplay.icon
            const daysRemaining = getDaysRemaining(goal.target_date)
            
            return (
              <div key={goal.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{goal.name}</h4>
                    <p className="text-sm text-gray-500">{goal.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">
                      {statusDisplay.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(statusDisplay.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amounts */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(goal.current_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Target</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(goal.target_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(goal.target_amount - goal.current_amount)}
                    </span>
                  </div>
                </div>

                {/* Status and Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
                    <span className={`text-xs font-medium ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Due {formatDate(goal.target_date)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No Goals Message */}
      {goals.length === 0 && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No savings goals yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first savings goal to start tracking your progress.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </button>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGoal}
        />
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
          onSubmit={(goalData) => handleUpdateGoal(editingGoal.id, goalData)}
        />
      )}
    </div>
  )
}

// Create Goal Modal Component
const CreateGoalModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    target_date: '',
    current_amount: 0
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount)
      })
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Savings Goal</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Emergency Fund"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your savings goal"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount (TZS)
              </label>
              <input
                type="number"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="500000"
                min="1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Amount (TZS)
              </label>
              <input
                type="number"
                name="current_amount"
                value={formData.current_amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
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
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Edit Goal Modal Component
const EditGoalModal = ({ goal, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: goal.name,
    description: goal.description,
    target_amount: goal.target_amount,
    target_date: goal.target_date,
    current_amount: goal.current_amount
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount)
      })
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Savings Goal</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount (TZS)
              </label>
              <input
                type="number"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Amount (TZS)
              </label>
              <input
                type="number"
                name="current_amount"
                value={formData.current_amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
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
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SavingsGoalsTab
