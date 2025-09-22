import { appwrite } from './appwrite';
import { COLLECTIONS } from './appwrite';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  isContact?: boolean;
}

// Cache for users to prevent frequent reloading
let usersCache: AppUser[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class UserDirectoryManager {
  /**
   * Get all users registered in the system
   * @param forceRefresh - Whether to force a refresh from the server
   * @returns List of users
   */
  async getAllUsers(forceRefresh = false): Promise<AppUser[]> {
    const now = Date.now();
    
    // Return cached users if available and not expired
    if (!forceRefresh && usersCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      return [...usersCache];
    }
    
    try {
      const result = await appwrite.listDocuments(COLLECTIONS.USERS, [
        'limit(100)'
      ]);
      
      usersCache = result.documents.map(doc => ({
        id: doc.$id,
        name: doc.name || 'Unknown User',
        email: doc.email || '',
        avatar: doc.avatar,
        createdAt: doc.$createdAt
      }));
      
      lastFetchTime = now;
      return [...usersCache];
    } catch (error) {
      console.error('Error fetching users:', error);
      return usersCache.length > 0 ? [...usersCache] : [];
    }
  }
  
  /**
   * Search for users by name or email
   * @param query - Search query
   * @returns List of matching users
   */
  async searchUsers(query: string): Promise<AppUser[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    try {
      const normalizedQuery = query.toLowerCase().trim();
      
      // Try to use cache first
      if (usersCache.length > 0) {
        return usersCache.filter(user => 
          user.name.toLowerCase().includes(normalizedQuery) || 
          user.email.toLowerCase().includes(normalizedQuery)
        );
      }
      
      // If no cache, fetch from server
      const result = await appwrite.listDocuments(COLLECTIONS.USERS, []);
      
      const matchingUsers = result.documents
        .filter(doc => 
          (doc.name && doc.name.toLowerCase().includes(normalizedQuery)) || 
          (doc.email && doc.email.toLowerCase().includes(normalizedQuery))
        )
        .map(doc => ({
          id: doc.$id,
          name: doc.name || 'Unknown User',
          email: doc.email || '',
          avatar: doc.avatar,
          createdAt: doc.$createdAt
        }));
      
      return matchingUsers;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
  
  /**
   * Get a specific user by ID
   * @param userId - User ID
   * @returns User object or null if not found
   */
  async getUserById(userId: string): Promise<AppUser | null> {
    // Check cache first
    const cachedUser = usersCache.find(user => user.id === userId);
    if (cachedUser) {
      return { ...cachedUser };
    }
    
    try {
      const user = await appwrite.getDocument(COLLECTIONS.USERS, userId);
      
      return {
        id: user.$id,
        name: user.name || 'Unknown User',
        email: user.email || '',
        avatar: user.avatar,
        createdAt: user.$createdAt
      };
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Mark users that are already contacts
   * @param users - List of users
   * @param currentUserId - Current user ID
   * @returns List of users with isContact flag
   */
  async markContacts(users: AppUser[], currentUserId: string): Promise<AppUser[]> {
    try {
      // Get all direct chats for the current user
      const directChatsResponse = await appwrite.listDocuments(COLLECTIONS.GROUPS, [
        `members.contains('${currentUserId}')`,
        `type=direct`
      ]);
      
      // Extract contact user IDs
      const contactIds = new Set<string>();
      
      directChatsResponse.documents.forEach(doc => {
        const members = doc.members || [];
        members.forEach((memberId: string) => {
          if (memberId !== currentUserId) {
            contactIds.add(memberId);
          }
        });
      });
      
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
  clearCache() {
    usersCache = [];
    lastFetchTime = 0;
  }
}

// Create a singleton instance
export const userDirectoryManager = new UserDirectoryManager();
