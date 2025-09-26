import { AppwriteService } from './appwriteService';
import { COLLECTIONS } from '@/lib/constants';
import { ID, Query } from 'appwrite';

export interface AppwriteUser {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  phone?: string;
  nida?: string;
  role?: string;
  status?: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  prefs: Record<string, any>;
}

export class UserService extends AppwriteService {
  constructor() {
    super();
  }

  // Get current user
  async getCurrentUser() {
    try {
      const user = await this.account.get();
      
      // Try to get additional user data from the database
      try {
        const userData = await this.getDocument(COLLECTIONS.USERS, user.$id);
        return { ...user, ...userData };
      } catch (error: any) {
        // If user document doesn't exist in the database, create it
        if (error?.code === 404) {
          try {
            // Create user document with basic info
            const userData = {
              name: user.name,
              email: user.email,
              emailVerification: user.emailVerification || false,
              phoneVerification: false,
              prefs: user.prefs || {}
            };
            
            await this.createDocument(
              COLLECTIONS.USERS,
              user.$id,
              userData
            );
            
            return { ...user, ...userData };
          } catch (createError) {
            console.error('Error creating user document:', createError);
            return user; // Return basic user data if we can't create the document
          }
        }
        
        // For other errors, just return the basic user data
        return user;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  // Search users by name or email
  async searchUsers(query: string, limit: number = 10): Promise<AppwriteUser[]> {
    try {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        return [];
      }

      // Search in users collection
      const response = await this.listDocuments(
        COLLECTIONS.USERS,
        [
          Query.search('name', query.trim()),
          Query.limit(limit)
        ]
      );

      // Manually map the response to AppwriteUser type
      return response.documents.map(doc => ({
        $id: doc.$id,
        $createdAt: doc.$createdAt,
        $updatedAt: doc.$updatedAt,
        name: doc.name || '',
        email: doc.email || '',
        phone: doc.phone || '',
        emailVerification: Boolean(doc.emailVerification),
        phoneVerification: Boolean(doc.phoneVerification),
        prefs: doc.prefs || {},
        role: doc.role || 'user',
        status: doc.status || 'active'
      } as AppwriteUser));
    } catch (error: any) {
      console.error('Error searching users:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  // Get users by IDs
  async getUsersByIds(userIds: string[]): Promise<AppwriteUser[]> {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return [];
    }
    
    try {
      // Filter out any invalid user IDs
      const validUserIds = userIds.filter(id => id && typeof id === 'string' && id.trim() !== '');
      
      if (validUserIds.length === 0) {
        return [];
      }
      
      // If there's only one ID, use getDocument for better performance
      if (validUserIds.length === 1) {
        try {
          const user = await this.getDocument(COLLECTIONS.USERS, validUserIds[0]);
          return [{
            $id: user.$id,
            $createdAt: user.$createdAt,
            $updatedAt: user.$updatedAt,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            emailVerification: Boolean(user.emailVerification),
            phoneVerification: Boolean(user.phoneVerification),
            prefs: user.prefs || {},
            role: user.role || 'user',
            status: user.status || 'active'
          }];
        } catch (error: any) {
          if (error?.code === 404) {
            console.warn(`User with ID ${validUserIds[0]} not found`);
            return [];
          }
          throw error;
        }
      }
      
      // For multiple IDs, use listDocuments with a query
      const response = await this.listDocuments(
        COLLECTIONS.USERS,
        [
          Query.equal('$id', validUserIds)
        ]
      );

      // Manually map the response to AppwriteUser type
      return response.documents.map(doc => ({
        $id: doc.$id,
        $createdAt: doc.$createdAt,
        $updatedAt: doc.$updatedAt,
        name: doc.name || '',
        email: doc.email || '',
        phone: doc.phone || '',
        emailVerification: Boolean(doc.emailVerification),
        phoneVerification: Boolean(doc.phoneVerification),
        prefs: doc.prefs || {},
        role: doc.role || 'user',
        status: doc.status || 'active'
      } as AppwriteUser));
    } catch (error: any) {
      console.error('Error getting users by IDs:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  // Login with email and password
  async login(email: string, password: string) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Create a session with Appwrite
      // This will throw an error if credentials are invalid
      const session = await this.account.createEmailPasswordSession(email, password);
      
      // Get user details
      const user = await this.getCurrentUser();
      
      return { success: true, user, session };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide specific error messages based on error codes
      if (error.code === 401) {
        throw new Error('Invalid email or password');
      } else if (error.code === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      
      throw new Error(error.message || 'Failed to login');
    }
  }
  
  // Create a new user account
  async createAccount(email: string, password: string, name: string) {
    try {
      const newUser = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );

      // Create user profile in database
      try {
        await this.createDocument(
          COLLECTIONS.USERS,
          newUser.$id,
          {
            name: newUser.name,
            email: newUser.email,
            phone: '',
            role: 'member',
            status: 'active',
            created_at: new Date().toISOString(),
          },
          [`read("user:${newUser.$id}")`, `write("user:${newUser.$id}")`]
        );
      } catch (dbError) {
        console.error('Error creating user profile:', dbError);
        // Continue even if database creation fails
      }

      return newUser;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  // Create email session (login)
  async createEmailSession(email: string, password: string) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Delete current session (logout)
  async deleteCurrentSession() {
    try {
      const currentSession = await this.account.getSession('current');
      await this.account.deleteSession(currentSession.$id);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // Delete all sessions
  async deleteAllSessions() {
    try {
      await this.account.deleteSessions();
    } catch (error) {
      console.error('Error deleting all sessions:', error);
      throw error;
    }
  }

  // Update user name
  async updateName(name: string) {
    try {
      await this.account.updateName(name);
      
      // Also update in database
      const user = await this.account.get();
      await this.updateDocument(COLLECTIONS.USERS, user.$id, {
        name,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating name:', error);
      throw error;
    }
  }

  // Update user email
  async updateEmail(email: string, password: string) {
    try {
      await this.account.updateEmail(email, password);
      
      // Also update in database
      const user = await this.account.get();
      await this.updateDocument(COLLECTIONS.USERS, user.$id, {
        email,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }

  // Update user password
  async updatePassword(password: string, oldPassword: string) {
    try {
      await this.account.updatePassword(password, oldPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Update user phone
  async updatePhone(phone: string) {
    try {
      const user = await this.account.get();
      await this.updateDocument(COLLECTIONS.USERS, user.$id, {
        phone,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating phone:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: string) {
    try {
      return await this.getDocument(COLLECTIONS.USERS, userId);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // List users
  async listUsers(queries?: string[]) {
    try {
      return await this.listDocuments(COLLECTIONS.USERS, queries);
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;
