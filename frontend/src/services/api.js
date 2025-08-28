// Simple API service for Kijumbe Superadmin System
const API_BASE_URL = 'http://localhost:3000/backend';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      console.log(`✅ API Response: ${response.status} ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // Login
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Extract data from the response
    if (response.success && response.data) {
      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    }
    
    return response;
  }

  // Logout
  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  // Get profile
  async getProfile() {
    return this.request('/auth/profile');
  }

  // Health check
  async healthCheck() {
    return this.request('/auth/health');
  }
}

// Create and export instance
const api = new ApiService();
export default api;
