import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, COLLECTIONS } from '../lib/appwrite';

interface AppwriteUser {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
  created?: string;
  name: string;
  email: string;
  emailVerification: boolean;
  phoneVerification?: boolean;
  prefs: Record<string, any>;
  accessedAt?: string;
}

interface AppwriteContextType {
  user: AppwriteUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<AppwriteUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AppwriteContext = createContext<AppwriteContextType | undefined>(undefined);

export const useAppwrite = () => {
  const context = useContext(AppwriteContext);
  if (!context) {
    throw new Error('useAppwrite must be used within an AppwriteProvider');
  }
  return context;
};

export const AppwriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
      if (!APPWRITE_PROJECT_ID || APPWRITE_PROJECT_ID === 'demo-project') {
        console.warn('Appwrite not properly configured');
        setUser(null);
        return;
      }

      console.log('Checking auth status...');
      const currentUser = await auth.getCurrentUser();
      
      if (currentUser) {
        console.log('User found:', currentUser.email || 'Anonymous');
        setUser(currentUser);
        
        // Only try to load profile for authenticated users (not anonymous)
        if (currentUser.$id !== 'anonymous') {
          await loadUserProfile(currentUser.$id);
        }
      } else {
        console.log('No user session found');
        setUser(null);
      }
    } catch (error: any) {
      console.error('Error in checkAuthStatus:', error);
      // If we get here, even anonymous session creation failed
      setUser({
        $id: 'anonymous',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        name: 'Anonymous',
        email: '',
        emailVerification: false,
        phoneVerification: false,
        prefs: {},
        accessedAt: new Date().toISOString()
      } as AppwriteUser);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Try to get user profile from database
      const userProfile = await db.getDocument(COLLECTIONS.USERS, userId);
      if (userProfile) {
        // Merge database data with auth data
        setUser(prev => prev ? { ...prev, ...userProfile } : null);
      }
    } catch (error) {
      // User profile doesn't exist in database yet, create it
      console.log('User profile not found in database, creating now...');
      
      try {
        // Get current user from auth service to access email and name
        const currentUser = await auth.getCurrentUser();
        
        if (currentUser && currentUser.$id === userId) {
          // Create the user profile with minimal fields that match the schema
          const userProfile = await db.createDocument(
            COLLECTIONS.USERS,
            userId,
            {
              name: currentUser.name,
              // Do not include 'email' if it's not in the schema
              // email: currentUser.email,
              role: 'member',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            [`read("user:${userId}")`, `write("user:${userId}")`]
          );
          
          console.log('User profile created successfully:', userProfile.$id);
          
          // Merge database data with auth data
          setUser(prev => prev ? { ...prev, ...userProfile } : null);
        } else {
          console.error('Failed to create user profile: Current user ID does not match');
        }
      } catch (createError) {
        console.error('Error creating user profile:', createError);
      }
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
      if (!APPWRITE_PROJECT_ID || APPWRITE_PROJECT_ID === 'demo-project') {
        return { 
          success: false, 
          error: 'Appwrite is not properly configured. Please check your environment variables.' 
        };
      }

      console.log('Attempting to log in with email:', email);
      
      // First, try to create an email session
      await auth.createEmailSession(email, password);
      console.log('Session created successfully');
      
      // Then get the current user
      const currentUser = await auth.getCurrentUser();
      console.log('User authenticated:', currentUser?.email);
      
      if (currentUser) {
        const appwriteUser: AppwriteUser = {
          $id: currentUser.$id,
          $createdAt: (currentUser as any).$createdAt || new Date().toISOString(),
          $updatedAt: (currentUser as any).$updatedAt || new Date().toISOString(),
          name: currentUser.name,
          email: currentUser.email,
          emailVerification: currentUser.emailVerification,
          phoneVerification: (currentUser as any).phoneVerification || false,
          prefs: currentUser.prefs || {},
          accessedAt: new Date().toISOString()
        };
        setUser(appwriteUser);
        // Load additional user data from database if needed
        await loadUserProfile(currentUser.$id);
        return { success: true };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const newUser = await auth.createAccount(email, password, name);
      
      if (newUser) {
        // Create user profile in database
        try {
          await db.createDocument(
            COLLECTIONS.USERS,
            newUser.$id,
            {
              email: newUser.email,
              name: newUser.name,
              role: 'member',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            [`read("user:${newUser.$id}")`, `write("user:${newUser.$id}")`]
          );
        } catch (dbError) {
          console.error('Error creating user profile:', dbError);
          // Continue even if database creation fails
        }

        const appwriteUser: AppwriteUser = {
          $id: newUser.$id,
          $createdAt: (newUser as any).$createdAt || new Date().toISOString(),
          $updatedAt: (newUser as any).$updatedAt || new Date().toISOString(),
          name: newUser.name,
          email: newUser.email,
          emailVerification: newUser.emailVerification,
          phoneVerification: (newUser as any).phoneVerification || false,
          prefs: newUser.prefs || {},
          accessedAt: new Date().toISOString()
        };
        setUser(appwriteUser);
        return { success: true };
      } else {
        return { success: false, error: 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await auth.deleteSessions();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<AppwriteUser>) => {
    try {
      if (user) {
        // Update in Appwrite account
        if (userData.name) {
          await auth.updateName(userData.name);
        }
        if (userData.email) {
          // Note: Email update requires password verification
          // await auth.updateEmail(userData.email, password);
        }

        // Update in database
        await db.updateDocument(COLLECTIONS.USERS, user.$id, {
          ...userData,
          updated_at: new Date().toISOString(),
        });

        // Update local state
        setUser(prev => prev ? { ...prev, ...userData } : null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.$id);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  const value: AppwriteContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AppwriteContext.Provider value={value}>
      {children}
    </AppwriteContext.Provider>
  );
};
