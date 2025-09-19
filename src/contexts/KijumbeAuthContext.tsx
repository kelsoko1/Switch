import React, { createContext, useContext, useState, useEffect } from 'react';
import { appwrite, COLLECTIONS } from '../lib/appwrite';
import { Query } from 'appwrite';

interface User {
  $id: string;
  email: string;
  name: string;
  role: 'member' | 'kiongozi' | 'admin' | 'superadmin';
  isSuperAdmin?: boolean;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface KijumbeAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isMember: () => boolean;
  isKiongozi: () => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const KijumbeAuthContext = createContext<KijumbeAuthContextType | undefined>(undefined);

export const useKijumbeAuth = () => {
  const context = useContext(KijumbeAuthContext);
  if (context === undefined) {
    throw new Error('useKijumbeAuth must be used within a KijumbeAuthProvider');
  }
  return context;
};

export const KijumbeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const isMember = () => user?.role === 'member';
  const isKiongozi = () => user?.role === 'kiongozi' || user?.role === 'admin' || user?.role === 'superadmin';
  const isAdmin = () => user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = () => user?.role === 'superadmin' || user?.isSuperAdmin === true;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Create session with Appwrite
      await appwrite.createEmailPasswordSession(email, password);
      
      // Get user account
      const account = await appwrite.getAccount();
      
      // Get user details from database
      const userResponse = await appwrite.listDocuments(COLLECTIONS.USERS, [
        Query.equal('email', email),
        Query.limit(1)
      ]);
      
      if (userResponse.documents.length === 0) {
        throw new Error('User not found in database');
      }
      
      const userData = userResponse.documents[0] as User;
      setUser(userData);
      
      // Store in localStorage for persistence
      localStorage.setItem('kijumbe_user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: string = 'member'): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Create account with Appwrite
      await appwrite.createAccount(email, password, name);
      
      // Create user document in database
      const userData = {
        email,
        name,
        role: role as 'member' | 'kiongozi' | 'admin' | 'superadmin',
        isSuperAdmin: role === 'superadmin',
        phone: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const createdUser = await appwrite.createDocument(COLLECTIONS.USERS, userData, [
        `read("user:${email}")`,
        `write("user:${email}")`
      ]);
      
      setUser(createdUser as User);
      localStorage.setItem('kijumbe_user', JSON.stringify(createdUser));
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await appwrite.deleteSessions();
      setUser(null);
      localStorage.removeItem('kijumbe_user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedUser = await appwrite.updateDocument(
        COLLECTIONS.USERS,
        user.$id,
        { ...userData, updatedAt: new Date().toISOString() }
      );
      
      setUser(updatedUser as User);
      localStorage.setItem('kijumbe_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const userResponse = await appwrite.getDocument(COLLECTIONS.USERS, user.$id);
      setUser(userResponse as User);
      localStorage.setItem('kijumbe_user', JSON.stringify(userResponse));
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Check if user is stored locally
        const storedUser = localStorage.getItem('kijumbe_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Verify session is still valid
          try {
            await appwrite.getAccount();
            setUser(userData);
          } catch (error) {
            // Session expired, clear local storage
            localStorage.removeItem('kijumbe_user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value: KijumbeAuthContextType = {
    user,
    loading,
    isAuthenticated,
    isMember,
    isKiongozi,
    isAdmin,
    isSuperAdmin,
    login,
    register,
    logout,
    updateUser,
    refreshUser
  };

  return (
    <KijumbeAuthContext.Provider value={value}>
      {children}
    </KijumbeAuthContext.Provider>
  );
};

export default KijumbeAuthContext;
