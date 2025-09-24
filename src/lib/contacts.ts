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
  lastMessage?: string;
  lastMessageTime?: string;
};

export interface Contact {
  id: string;
  userId: string;
  contactId: string;
  name: string;
  email: string;
  avatar?: string;
  chatGroupId?: string;
  createdAt: string;
}

// Cache for contacts to prevent frequent reloading
let contactsCache: Map<string, Contact[]> = new Map();
let lastFetchTimes: Map<string, number> = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export class ContactManager {
  /**
   * Add a new contact
   * @param userId - Current user ID
   * @param contactEmail - Email of the contact to add
   * @returns The created contact
   */
  async addContact(userId: string, contactEmail: string): Promise<Contact> {
    try {
      // First check if the contact exists in the system
      const usersResult = await database.listDocuments(COLLECTIONS.USERS, [
        Query.equal('email', contactEmail.trim().toLowerCase())
      ]);


      
      const foundUsers = usersResult.documents as AppwriteUser[];
      if (foundUsers.length === 0) {
        throw new Error('User not found. Please invite them to join Switch.');
      }
      
      const contactUser = foundUsers[0];
      
      // Don't allow adding yourself
      if (contactUser.$id === userId) {
        throw new Error("You can't add yourself as a contact.");
      }
      
      // Check if contact already exists
      const contactsResult = await database.listDocuments(COLLECTIONS.GROUPS, [
        Query.equal('type', 'direct'),
        Query.search('members', userId),
        Query.search('members', contactUser.$id)
      ]);


      
      const existingGroups = contactsResult.documents as AppwriteGroup[];
      if (existingGroups.length > 0) {
        throw new Error('This contact is already in your list.');
      }
      
      // Get current user details
      const currentUser = await database.getDocument(COLLECTIONS.USERS, userId) as AppwriteUser;
      
      // Create a direct chat group (which serves as a contact)
      const groupData = {
        name: `${currentUser.name} & ${contactUser.name}`,
        type: 'direct',
        members: [userId, contactUser.$id],
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const createdGroup = await database.createDocument(COLLECTIONS.GROUPS, groupData) as AppwriteGroup;
      
      // Clear the contacts cache for this user
      this.clearUserCache(userId);
      
      return {
        id: createdGroup.$id,
        userId,
        contactId: contactUser.$id,
        name: contactUser.name,
        email: contactUser.email,
        avatar: contactUser.avatar,
        chatGroupId: createdGroup.$id,
        createdAt: createdGroup.$createdAt
      };
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  }
  
  /**
   * Get all contacts for a user
   * @param userId - Current user ID
   * @param forceRefresh - Whether to force a refresh from the server
   * @returns List of contacts
   */
  async getContacts(userId: string, forceRefresh = false): Promise<Contact[]> {
    const now = Date.now();
    
    // Return cached contacts if available and not expired
    if (!forceRefresh && 
        contactsCache.has(userId) && 
        lastFetchTimes.has(userId) && 
        (now - lastFetchTimes.get(userId)!) < CACHE_DURATION) {
      return [...contactsCache.get(userId)!];
    }
    
    try {
      // Get all direct chat groups for the user
      const directChatsResponse = await database.listDocuments(COLLECTIONS.GROUPS, [
        Query.equal('type', 'direct'),
        Query.search('members', userId)
      ]);


      
      const contacts = await Promise.all((directChatsResponse.documents as AppwriteGroup[]).map(async (doc) => {
        // Find the other user in the direct chat
        const contactId = doc.members.find((id: string) => id !== userId);
        let contactName = 'Unknown Contact';
        let contactEmail = '';
        let contactAvatar = undefined;
        
        // Get the other user's details
        if (contactId) {
          try {
            const contactUser = await database.getDocument(COLLECTIONS.USERS, contactId) as AppwriteUser;
            contactName = contactUser.name?.toString() || 'Unknown Contact';
            contactEmail = contactUser.email?.toString() || '';
            contactAvatar = contactUser.avatar;
          } catch (error) {
            console.error('Error fetching contact details:', error);
          }
        }
        
        return {
          id: doc.$id,
          userId,
          contactId: contactId || '',
          name: contactName,
          email: contactEmail,
          avatar: contactAvatar,
          chatGroupId: doc.$id,
          createdAt: doc.$createdAt
        };
      }));
      
      // Update cache
      contactsCache.set(userId, contacts);
      lastFetchTimes.set(userId, now);
      
      return contacts;
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }
  
  /**
   * Clear the contacts cache for a specific user
   * @param userId - User ID to clear cache for
   */
  clearUserCache(userId: string) {
    if (contactsCache.has(userId)) {
      contactsCache.delete(userId);
      lastFetchTimes.delete(userId);
    }
  }
  
  /**
   * Clear all contacts cache
   */
  clearCache() {
    contactsCache.clear();
    lastFetchTimes.clear();
  }
  
  /**
   * Generate invite links for sharing with non-Switch users
   * @returns Object containing various invite links
   */
  generateInviteLinks() {
    const baseUrl = window.location.origin;
    const registerUrl = `${baseUrl}/auth/register`;
    
    return {
      registerUrl,
      whatsappLink: `https://wa.me/?text=Hey! Join me on Switch, a great app for chats and group payments. Sign up here: ${registerUrl}`,
      smsLink: `sms:?&body=Hey! Join me on Switch, a great app for chats and group payments. Sign up here: ${registerUrl}`
    };
  }
}

// Create a singleton instance
export const contactManager = new ContactManager();
