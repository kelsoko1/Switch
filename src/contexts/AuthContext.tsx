import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { appwrite } from '../lib/appwrite';
import { userService } from '../services/appwrite';

interface User {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (email: string, password: string, name: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First, try to get the current account
        const account = await appwrite.getAccount();
        
        if (account) {
          console.log('✅ User authenticated:', account.email);
          setUser({
            $id: account.$id,
            name: account.name,
            email: account.email,
            avatar: account.prefs?.avatar,
          });
        } else {
          console.log('No active session, user is not authenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in checkAuthStatus:', error);
        // Create anonymous session as fallback
        try {
          console.log('Attempting to create anonymous session...');
          await appwrite.createAnonymousSession();
          console.log('Anonymous session created successfully');
        } catch (anonError) {
          console.error('Failed to create anonymous session:', anonError);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      console.log('Attempting login for:', email);
      
      // Validate input
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }
      
      // First, check if we're already logged in
      try {
        const existingAccount = await appwrite.getAccount();
        if (existingAccount && existingAccount.email === email) {
          // We're already logged in as this user
          console.log('Already logged in as this user');
          setUser({
            $id: existingAccount.$id,
            name: existingAccount.name,
            email: existingAccount.email,
            avatar: existingAccount.prefs?.avatar,
          });
          return { success: true };
        } else if (existingAccount) {
          console.log('Logged in as different user, logging out first');
          // Log out the existing session first
          await appwrite.deleteSessions();
        }
      } catch (e) {
        // No existing session, continue with login
        console.log('No existing session, proceeding with login');
      }

      // Use the userService to login - this will validate credentials against Appwrite
      try {
        console.log('Using userService for login...');
        const result = await userService.login(email, password);
        
        if (result.success && result.user) {
          console.log('Login successful for:', result.user.email);
          setUser({
            $id: result.user.$id,
            name: result.user.name,
            email: result.user.email,
            avatar: result.user.prefs?.avatar,
          });
          return { success: true };
        } else {
          throw new Error('Failed to get user details after login');
        }
      } catch (error: any) {
        console.error('Authentication error:', error);
        return { 
          success: false, 
          error: error.message || 'Invalid email or password'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide more specific error messages based on error codes
      let errorMessage = 'Failed to login';
      
      if (error.code) {
        switch (error.code) {
          case 401:
            errorMessage = 'Invalid email or password';
            break;
          case 429:
            errorMessage = 'Too many login attempts. Please try again later.';
            break;
          case 503:
            errorMessage = 'Authentication service is temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = error.message || 'Authentication failed. Please try again.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<LoginResult> => {
    try {
      console.log('Attempting to register new account for:', email);
      
      // Create the account
      const account = await appwrite.createAccount(email, password, name);
      console.log('Account created successfully:', account.$id);
      
      // Log the user in
      console.log('Logging in with new account...');
      return await login(email, password);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Provide more specific error messages based on error codes
      let errorMessage = 'Failed to register';
      
      if (error.code) {
        switch (error.code) {
          case 400:
            if (error.message.includes('email')) {
              errorMessage = 'Invalid email format';
            } else if (error.message.includes('password')) {
              errorMessage = 'Password must be at least 8 characters';
            } else {
              errorMessage = 'Invalid registration data';
            }
            break;
          case 409:
            errorMessage = 'An account with this email already exists';
            break;
          case 429:
            errorMessage = 'Too many registration attempts. Please try again later.';
            break;
          case 503:
            errorMessage = 'Registration service is temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = error.message || 'Registration failed. Please try again.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await appwrite.deleteSessions();
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with logout even if there's an error
    } finally {
      // Always clear the user state
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
