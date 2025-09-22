import { appwrite } from './appwrite';
import { COLLECTIONS } from './appwrite';

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
      const usersResult = await appwrite.listDocuments(COLLECTIONS.USERS, [
        `email=${contactEmail.trim().toLowerCase()}`
      ]);
      
      if (usersResult.documents.length === 0) {
        throw new Error('User not found. Please invite them to join Switch.');
      }
      
      const contactUser = usersResult.documents[0];
      
      // Don't allow adding yourself
      if (contactUser.$id === userId) {
        throw new Error("You can't add yourself as a contact.");
      }
      
      // Check if contact already exists
      const contactsResult = await appwrite.listDocuments(COLLECTIONS.GROUPS, [
        `type=direct`,
        `members.contains('${userId}')`,
        `members.contains('${contactUser.$id}')`
      ]);
      
      if (contactsResult.documents.length > 0) {
        throw new Error('This contact is already in your list.');
      }
      
      // Get current user details
      const currentUser = await appwrite.getDocument(COLLECTIONS.USERS, userId);
      
      // Create a direct chat group (which serves as a contact)
      const groupData = {
        name: `${currentUser.name} & ${contactUser.name}`,
        type: 'direct',
        members: [userId, contactUser.$id],
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const createdGroup = await appwrite.createDocument(COLLECTIONS.GROUPS, groupData);
      
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
      const directChatsResponse = await appwrite.listDocuments(COLLECTIONS.GROUPS, [
        `members.contains('${userId}')`,
        `type=direct`
      ]);
      
      const contacts = await Promise.all(directChatsResponse.documents.map(async (doc) => {
        // Find the other user in the direct chat
        const contactId = doc.members.find((id: string) => id !== userId);
        let contactName = 'Unknown Contact';
        let contactEmail = '';
        let contactAvatar = undefined;
        
        // Get the other user's details
        if (contactId) {
          try {
            const contactUser = await appwrite.getDocument(COLLECTIONS.USERS, contactId);
            contactName = contactUser.name || 'Unknown Contact';
            contactEmail = contactUser.email || '';
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
