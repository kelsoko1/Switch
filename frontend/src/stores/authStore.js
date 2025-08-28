import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email, password) => {
        try {
          set({ isLoading: true });
          
          console.log('🔐 Attempting login...');
          const response = await api.login(email, password);
          
          if (response.success) {
            const { user, token } = response;
            
            if (!token) {
              throw new Error('No token received from server');
            }
            
            // Store token
            localStorage.setItem('token', token);
            
            // Update state
            set({
              user: {
                ...user,
                isSuperAdmin: user.role === 'superadmin' || user.isSuperAdmin
              },
              token,
              isAuthenticated: true,
              isLoading: false
            });
            
            console.log('✅ Login successful:', user.name || user.email);
            return { success: true, user };
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('❌ Login error:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch (error) {
          console.error('⚠️ Logout API error:', error);
        } finally {
          // Clear everything
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
          console.log('✅ Logout completed');
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
          return false;
        }

        try {
          const response = await api.getProfile();
          if (response.success) {
            set({
              user: response.user,
              token,
              isAuthenticated: true
            });
            return true;
          } else {
            throw new Error('Profile fetch failed');
          }
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
          return false;
        }
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        console.log('🧹 Auth state cleared');
      }
    }),
    {
      name: 'kijumbe-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
