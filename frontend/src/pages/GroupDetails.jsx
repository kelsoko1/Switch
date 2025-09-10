import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { groupsAPI } from '../services/api'
import { Users, DollarSign, Calendar, User, Phone, Mail, Crown } from 'lucide-react'

const GroupDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { error } = useToast()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroupDetails()
  }, [id])

  const fetchGroupDetails = async () => {
    try {
      const response = await groupsAPI.getById(id)
      setGroup(response.data.data.group)
      setMembers(response.data.data.members)
    } catch (err) {
      error('Failed to fetch group details')
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

  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Group not found</h2>
        <p className="text-gray-600 mt-2">The group you're looking for doesn't exist.</p>
      </div>
    )
  }

  const isKiongozi = group.kiongozi_id === user?.id

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600 mt-1">
              {isKiongozi ? 'You are the leader of this group' : 'You are a member of this group'}
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            group.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {group.status}
          </span>
        </div>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-semibold text-gray-900">
                {members.length}/{group.max_members}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contribution</p>
              <p className="text-2xl font-semibold text-gray-900">
                {group.contribution_amount?.toLocaleString()} TZS
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Duration</p>
              <p className="text-2xl font-semibold text-gray-900">
                {group.rotation_duration} months
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Group Information</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Group Name</span>
              <span className="text-sm text-gray-900">{group.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Current Rotation</span>
              <span className="text-sm text-gray-900">#{group.current_rotation}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Created</span>
              <span className="text-sm text-gray-900">
                {new Date(group.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Status</span>
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

        {/* Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          
          <div className="space-y-3">
            {isKiongozi && (
              <>
                <button className="btn btn-primary w-full">
                  Add Member
                </button>
                <button className="btn btn-outline w-full">
                  Send Message
                </button>
                <button className="btn btn-outline w-full">
                  Edit Group
                </button>
              </>
            )}
            
            <button className="btn btn-outline w-full">
              View Transactions
            </button>
            
            <button className="btn btn-outline w-full">
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Members</h2>
          <span className="text-sm text-gray-500">
            {members.length} of {group.max_members} members
          </span>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No members yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isKiongozi ? 'Start by adding members to your group.' : 'This group has no members yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {member.user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {member.user?.name || 'Unknown User'}
                      </h3>
                      {member.user_id === group.kiongozi_id && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{member.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Member #{member.member_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      Rotation #{member.rotation_order}
                    </p>
                  </div>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status}
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

export default GroupDetails
