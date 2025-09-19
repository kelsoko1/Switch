import { AppwriteService } from './appwriteService';
import { COLLECTIONS } from '@/lib/constants';
import { ID } from 'appwrite';

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
      } catch (error) {
        // If user document doesn't exist in the database, return just the account data
        return user;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
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
