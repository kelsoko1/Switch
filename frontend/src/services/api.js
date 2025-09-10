import axios from 'axios'

// Use the backend API endpoint
export const api = axios.create({
  baseURL: '/backend',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for 401 errors, not network errors or other issues
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Only redirect if we're not already on the login page to prevent loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  getUsers: () => api.get('/auth/users'),
}

// Groups API
export const groupsAPI = {
  create: (groupData) => api.post('/groups/create', groupData),
  getMyGroups: () => api.get('/groups/my-groups'),
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
}

// WhatsApp API
export const whatsappAPI = {
  getStatus: () => api.get('/whatsapp/status'),
  sendMessage: (phoneNumber, message) => api.post('/whatsapp/send', { phoneNumber, message }),
  sendGroupMessage: (groupId, message) => api.post('/whatsapp/send-group', { groupId, message }),
  getQueue: () => api.get('/whatsapp/queue'),
}

// Admin API
export const adminAPI = {
  getStatistics: () => api.get('/admin/statistics'),
  getRecentActivity: () => api.get('/admin/recent-activity'),
  getUsers: (page = 1, limit = 10) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  getGroups: (page = 1, limit = 10) => api.get(`/admin/groups?page=${page}&limit=${limit}`),
  updateUserStatus: (userId, status) => api.patch(`/admin/users/${userId}/status`, { status }),
  updateGroupStatus: (groupId, status) => api.patch(`/admin/groups/${groupId}/status`, { status }),
}

// Wallet API
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  setPin: (pin, confirmPin) => api.post('/wallet/pin', { pin, confirmPin }),
  verifyPin: (pin) => api.post('/wallet/pin/verify', { pin }),
  getPaymentMethods: () => api.get('/wallet/payment-methods'),
  deposit: (amount, paymentMethod, paymentData) => api.post('/wallet/deposit', { amount, paymentMethod, paymentData }),
  withdraw: (amount, pin, withdrawalData) => api.post('/wallet/withdraw', { amount, pin, withdrawalData }),
  getTransactions: (page = 1, limit = 20, type = null) => api.get(`/wallet/transactions?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}`),
  verifyPayment: (orderId) => api.post('/wallet/verify-payment', { orderId }),
  getStats: () => api.get('/wallet/stats'),
  
  // Savings Goals API
  getSavingsGoals: () => api.get('/wallet/savings-goals'),
  createSavingsGoal: (goalData) => api.post('/wallet/savings-goals', goalData),
  updateSavingsGoal: (goalId, goalData) => api.put(`/wallet/savings-goals/${goalId}`, goalData),
  deleteSavingsGoal: (goalId) => api.delete(`/wallet/savings-goals/${goalId}`),
  
  // Contributions API
  getContributions: () => api.get('/wallet/contributions'),
  makeContribution: (groupId, amount) => api.post('/wallet/contributions', { group_id: groupId, amount }),
  
  // Group Payments API (Kiongozi only)
  getGroupPayments: () => api.get('/wallet/group-payments'),
  processGroupPayment: (paymentData) => api.post('/wallet/group-payments', paymentData),
}

export default api
