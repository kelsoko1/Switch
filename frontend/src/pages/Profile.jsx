import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { User, Mail, Shield, Calendar, Edit3, Save, X } from 'lucide-react'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const { success, error } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    })
  }

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to update the user
      // For now, we'll just update the local state
      updateUser({ ...user, ...formData })
      success('Profile updated successfully!')
      setIsEditing(false)
    } catch (err) {
      error('Failed to update profile')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800'
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'kiongozi':
        return 'bg-blue-100 text-blue-800'
      case 'member':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="btn btn-outline flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
        
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                </span>
                {user?.isSuperAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    🔥 Super Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <User className="h-4 w-4 inline mr-2" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900 py-2">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="label">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-gray-900 py-2">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="label">
                <Shield className="h-4 w-4 inline mr-2" />
                Role
              </label>
              <p className="text-gray-900 py-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                </span>
              </p>
            </div>

            <div>
              <label className="label">
                <Calendar className="h-4 w-4 inline mr-2" />
                Member Since
              </label>
              <p className="text-gray-900 py-2">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Account Status</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user?.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {user?.status?.charAt(0)?.toUpperCase() + user?.status?.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Last Login</span>
            <span className="text-sm text-gray-900">
              {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Super Admin</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user?.isSuperAdmin 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user?.isSuperAdmin ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
        
        <div className="space-y-4">
          <button className="btn btn-outline w-full">
            Change Password
          </button>
          <button className="btn btn-outline w-full">
            Two-Factor Authentication
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
