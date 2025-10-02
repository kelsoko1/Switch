import React, { createContext, useContext, useState, useEffect } from 'react';
import { services, database, COLLECTIONS } from '../lib/appwrite';
import { Models, Query } from 'appwrite';

interface AppwriteUser extends Models.Document {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'sw';
    textSize: 'small' | 'medium' | 'large';
    emailNotifications: boolean;
    pushNotifications: boolean;
    transactionAlerts: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
  };
}

interface AppwriteContextType {
  user: AppwriteUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (data: Partial<AppwriteUser>) => Promise<void>;
  updatePreferences: (preferences: Partial<AppwriteUser['preferences']>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AppwriteContext = createContext<AppwriteContextType | null>(null);

export const useAppwrite = () => {
  const context = useContext(AppwriteContext);
  if (!context) {
    throw new Error('useAppwrite must be used within an AppwriteProvider');
  }
  return context;
};

export const AppwriteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const account = await services.account.get();
      if (account) {
        await loadUserProfile(account.$id);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Try to get user profile from database
      const response = await database.listDocuments(COLLECTIONS.USERS, [
        Query.equal('$id', userId)
      ]);

      if (response.total > 0) {
        const userProfile = response.documents[0] as AppwriteUser;
        setUser(prev => prev ? { ...prev, ...userProfile } : userProfile);
      } else {
        // Get current user from account service
        const currentUser = await services.account.get();
        
        if (currentUser && currentUser.$id === userId) {
          // Create the user profile with minimal fields that match the schema
          const newUser = await database.createDocument(COLLECTIONS.USERS, {
            name: currentUser.name,
            email: currentUser.email,
            preferences: {
              theme: 'system',
              language: 'en',
              textSize: 'medium',
              emailNotifications: true,
              pushNotifications: true,
              transactionAlerts: true,
              securityAlerts: true,
              marketingEmails: false
            }
          });

          setUser(newUser as AppwriteUser);
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await services.account.createSession(email, password);
      const account = await services.account.get();
      await loadUserProfile(account.$id);
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid email or password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const account = await services.account.create('unique()', email, password, name);
      await services.account.createSession(email, password);
      await loadUserProfile(account.$id);
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await services.account.deleteSession('current');
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Failed to logout');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<AppwriteUser>) => {
    if (!user) throw new Error('Not authenticated');

    try {
      setIsLoading(true);
      setError(null);

      // Update name in account if changed
      if (data.name) {
        await services.account.updateName(data.name);
      }

      // Update profile in database
      const updatedUser = await database.updateDocument(
        COLLECTIONS.USERS,
        user.$id,
        data
      );

      setUser(updatedUser as AppwriteUser);
    } catch (err) {
      console.error('Profile update failed:', err);
      setError('Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences: Partial<AppwriteUser['preferences']>) => {
    if (!user) throw new Error('Not authenticated');

    try {
      setIsLoading(true);
      setError(null);

      const updatedUser = await database.updateDocument(
        COLLECTIONS.USERS,
        user.$id,
        {
          preferences: {
            ...user.preferences,
            ...preferences
          }
        }
      );

      setUser(updatedUser as AppwriteUser);
    } catch (err) {
      console.error('Preferences update failed:', err);
      setError('Failed to update preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('Not authenticated');

    try {
      setIsLoading(true);
      setError(null);

      // Delete user profile from database
      await database.deleteDocument(COLLECTIONS.USERS, user.$id);

      // Delete all sessions (logout)
      // Note: Full account deletion requires server-side implementation
      // For now, we delete the user document and logout
      await services.account.deleteSessions();
      setUser(null);
    } catch (err) {
      console.error('Account deletion failed:', err);
      setError('Failed to delete account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    updateProfile,
    updatePreferences,
    deleteAccount,
  };

  return (
    <AppwriteContext.Provider value={value}>
      {children}
    </AppwriteContext.Provider>
  );
};

export default AppwriteContext;
