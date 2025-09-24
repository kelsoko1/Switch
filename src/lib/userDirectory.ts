import { Models, Query } from 'appwrite';
import { database, COLLECTIONS } from './appwrite';

type AppwriteUser = Models.Document & {
  name?: string;
  email?: string;
  avatar?: string;
};

type AppwriteGroup = Models.Document & {
  members: string[];
  type: string;
  name?: string;
  avatar?: string;
};

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

export class UserDirectoryManager {
  /**
   * Get all users
   * @param forceRefresh Force refresh from server
   */
  async getAllUsers(forceRefresh = false): Promise<AppUser[]> {
    const now = Date.now();
    
    // Return cached users if available and not expired
    if (!forceRefresh && usersCache && usersCache.length > 0 && (now - lastFetchTime) < CACHE_TTL) {
      return [...usersCache];
    }
    
    try {
      const response = await database.listDocuments(COLLECTIONS.USERS);
      
      if (response.total === 0) {
        return [];
      }

      usersCache = response.documents.map((doc: Models.Document) => ({
        id: doc.$id,
        name: (doc as AppwriteUser).name || 'Unknown User',
        email: (doc as AppwriteUser).email || '',
        avatar: (doc as AppwriteUser).avatar,
        createdAt: doc.$createdAt
      }));
      
      lastFetchTime = now;
      return [...usersCache];
    } catch (error) {
      console.error('Error fetching users:', error);
      return usersCache ? [...usersCache] : [];
    }
  }
  
  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<AppUser[]> {
    if (!query) {
      return [];
    }
    
    try {
      const normalizedQuery = query.toLowerCase().trim();
      
      // Try to use cache first
      if (usersCache && usersCache.length > 0) {
        return usersCache.filter(user => 
          user.name.toLowerCase().includes(normalizedQuery) || 
          user.email.toLowerCase().includes(normalizedQuery)
        );
      }
      
      const response = await database.listDocuments(COLLECTIONS.USERS);
      
      return response.documents
        .filter((doc) => {
          const userDoc = doc as AppwriteUser;
          return (userDoc.name && userDoc.name.toLowerCase().includes(normalizedQuery)) || 
                 (userDoc.email && userDoc.email.toLowerCase().includes(normalizedQuery));
        })
        .map((doc) => ({
          id: doc.$id,
          name: (doc as AppwriteUser).name || 'Unknown User',
          email: (doc as AppwriteUser).email || '',
          avatar: (doc as AppwriteUser).avatar,
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
    // Check cache first
    const cachedUser = usersCache && usersCache.find(user => user.id === userId);
    if (cachedUser) {
      return { ...cachedUser };
    }
    
    try {
      const doc = await database.getDocument(COLLECTIONS.USERS, userId) as AppwriteUser;
      
      return {
        id: doc.$id,
        name: doc.name || 'Unknown User',
        email: doc.email || '',
        avatar: doc.avatar,
        createdAt: doc.$createdAt
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
      const directChatsResponse = await database.listDocuments(COLLECTIONS.GROUPS, [
        Query.equal('type', 'direct'),
        Query.search('members', currentUserId)
      ]);

      // Create a map of contact IDs
      const contactIds = new Set(
        directChatsResponse.documents
          .filter((chat: Models.Document) => (chat as AppwriteGroup).members && (chat as AppwriteGroup).members.length === 2)
          .map((chat: Models.Document) => (chat as AppwriteGroup).members.find(id => id !== currentUserId))
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

export const userDirectory = new UserDirectoryManager();
