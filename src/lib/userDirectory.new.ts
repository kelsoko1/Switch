import { Models } from 'appwrite';
import { database, COLLECTIONS } from './appwrite';

// Types
interface UserDocument extends Models.Document {
  name?: string;
  email?: string;
  avatar?: string;
}

interface GroupDocument extends Models.Document {
  members: string[];
  type: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  isContact?: boolean;
}

// Cache
let usersCache: AppUser[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class UserDirectory {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<AppUser[]> {
    const now = Date.now();

    // Return cache if valid
    if (usersCache && now - lastFetchTime < CACHE_TTL) {
      return usersCache;
    }

    try {
      const response = await database.listDocuments<UserDocument>(COLLECTIONS.USERS);

      if (response.total === 0) {
        return [];
      }

      usersCache = response.documents.map((doc) => ({
        id: doc.$id,
        name: doc.name || 'Unknown User',
        email: doc.email || '',
        avatar: doc.avatar,
        createdAt: doc.$createdAt
      }));

      lastFetchTime = now;
      return usersCache;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<AppUser[]> {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    try {
      const response = await database.listDocuments<UserDocument>(COLLECTIONS.USERS);
      
      return response.documents
        .filter((doc) => 
          (doc.name && doc.name.toLowerCase().includes(normalizedQuery)) || 
          (doc.email && doc.email.toLowerCase().includes(normalizedQuery))
        )
        .map((doc) => ({
          id: doc.$id,
          name: doc.name || 'Unknown User',
          email: doc.email || '',
          avatar: doc.avatar,
          createdAt: doc.$createdAt
        }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AppUser | null> {
    if (!userId) {
      return null;
    }

    try {
      const response = await database.getDocument<UserDocument>(COLLECTIONS.USERS, userId);
      
      return {
        id: response.$id,
        name: response.name || 'Unknown User',
        email: response.email || '',
        avatar: response.avatar,
        createdAt: response.$createdAt
      };
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Mark users that are contacts of the current user
   */
  async markContacts(users: AppUser[], currentUserId: string): Promise<AppUser[]> {
    try {
      // Get all direct chats for the current user
      const directChatsResponse = await database.listDocuments<GroupDocument>(COLLECTIONS.GROUPS, [
        `members.contains('${currentUserId}')`,
        `type=direct`
      ]);

      // Create a map of contact IDs
      const contactIds = new Set(
        directChatsResponse.documents
          .filter(chat => chat.members && chat.members.length === 2)
          .map(chat => chat.members.find(id => id !== currentUserId))
          .filter(Boolean)
      );

      // Mark contacts in the users list
      return users.map(user => ({
        ...user,
        isContact: contactIds.has(user.id)
      }));
    } catch (error) {
      console.error('Error marking contacts:', error);
      return users;
    }
  }

  /**
   * Clear the users cache
   */
  clearCache(): void {
    usersCache = null;
    lastFetchTime = 0;
  }
}

export const userDirectory = new UserDirectory();
