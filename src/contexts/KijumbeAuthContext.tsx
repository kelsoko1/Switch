import React, { createContext, useContext, useState, useEffect } from 'react';
import { services, database, COLLECTIONS } from '../lib/appwrite';
import { Models } from 'appwrite';

interface User extends Models.Document {
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('kijumbe_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const account = await services.account.get();
      if (account) {
        const response = await database.listDocuments(COLLECTIONS.USERS, [
          `email=${account.email}`,
          'limit(1)'
        ]);

        if (response.total > 0) {
          const userData = response.documents[0] as User;
          setUser(userData);
          localStorage.setItem('kijumbe_user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      localStorage.removeItem('kijumbe_user');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Create session with Appwrite
      await services.account.createEmailSession(email, password);
      
      // Get user details from database
      const response = await database.listDocuments(COLLECTIONS.USERS, [
        `email=${email}`,
        'limit(1)'
      ]);
      
      if (response.total === 0) {
        throw new Error('User not found in database');
      }
      
      const userData = response.documents[0] as User;
      setUser(userData);
      
      // Store in localStorage for persistence
      localStorage.setItem('kijumbe_user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Create account with Appwrite
      await services.account.create('unique()', email, password, name);
      
      // Create user document in database
      const userData = {
        email,
        name,
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await database.createDocument(COLLECTIONS.USERS, userData);
      const newUser = response as User;
      
      setUser(newUser);
      localStorage.setItem('kijumbe_user', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Register error:', error);
      setError('Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await services.account.deleteSessions();
      setUser(null);
      localStorage.removeItem('kijumbe_user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) return;
    
    try {
      const response = await database.updateDocument(
        COLLECTIONS.USERS,
        user.$id,
        { ...userData, updatedAt: new Date().toISOString() }
      );
      
      const updatedUser = response as User;
      setUser(updatedUser);
      localStorage.setItem('kijumbe_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const response = await database.getDocument(COLLECTIONS.USERS, user.$id);
      const refreshedUser = response as User;
      setUser(refreshedUser);
      localStorage.setItem('kijumbe_user', JSON.stringify(refreshedUser));
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
