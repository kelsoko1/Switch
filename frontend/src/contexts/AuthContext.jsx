import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  // Add a fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - setting loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile')
      setUser(response.data.data.user)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      // Only logout if it's a 401 error (unauthorized), not network errors
      if (error.response?.status === 401) {
        logout()
      } else {
        // For other errors (network, 500, etc.), just set loading to false
        // Don't logout as it might be a temporary server issue
        setLoading(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user: userData, token: userToken } = response.data.data
      
      setUser(userData)
      setToken(userToken)
      localStorage.setItem('token', userToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`
      
      return { success: true, user: userData }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { user: newUser, token: userToken } = response.data.data
      
      setUser(newUser)
      setToken(userToken)
      localStorage.setItem('token', userToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`
      
      return { success: true, user: newUser }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const isAdmin = () => {
    return user?.role === 'admin' || user?.isSuperAdmin
  }

  const isKiongozi = () => {
    return user?.role === 'kiongozi' || isAdmin()
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isKiongozi,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
