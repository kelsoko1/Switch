import { database, COLLECTIONS, services } from './appwrite';
import { createSimpleXMPPManager, SimpleXMPPManager, SimpleXMPPMessage, xml } from './xmpp-simple';
import { Models } from 'appwrite';

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  type: 'text' | 'image' | 'video' | 'file';
  url?: string;
  created_at: string;
  updated_at: string;
}

interface AppwriteChatMessage extends Models.Document {
  content: string;
  sender_id: string;
  recipient_id: string;
  type: 'text' | 'image' | 'video' | 'file';
  url?: string;
}

export class ChatManager {
  private xmppManager: SimpleXMPPManager | null = null;
  private isXMPPConnected = false;

  constructor() {
    this.initializeXMPP();
  }

  /**
   * Initialize XMPP connection
   */
  private async initializeXMPP(): Promise<void> {
    try {
      // Get current user
      const account = await services.account.get();
      if (!account) {
        console.warn('No authenticated user, XMPP initialization skipped');
        return;
      }

      // Create XMPP manager with correct signature
      this.xmppManager = createSimpleXMPPManager(
        account.email.split('@')[0], // username
        account.$id, // password - Use Appwrite user ID
        {
          server: 'wss://xmpp.switch.app:5280/ws',
          domain: 'switch.app',
          debug: false
        }
      );

      // Set up event handlers if manager was created successfully
      if (this.xmppManager) {
        // Note: SimpleXMPPManager doesn't have .on() method
        // It uses direct method calls for connection
        // Connect
        await this.xmppManager.connect();
        this.isXMPPConnected = true;
        console.log('XMPP connected');
      }
    } catch (error) {
      console.error('Error initializing XMPP:', error);
      this.isXMPPConnected = false;
    }
  }

  /**
   * Get chat messages
   */
  async getMessages(recipientId: string, limit = 50): Promise<ChatMessage[]> {
    try {
      const account = await services.account.get();
      if (!account) throw new Error('Not authenticated');

      const response = await database.listDocuments('chat_messages', [
        `sender_id=${account.$id}`,
        `recipient_id=${recipientId}`,
        'orderDesc(created_at)',
        `limit(${limit})`
      ]);

      return response.documents.map((doc: AppwriteChatMessage) => ({
        id: doc.$id,
        content: doc.content,
        sender_id: doc.sender_id,
        recipient_id: doc.recipient_id,
        type: doc.type,
        url: doc.url,
        created_at: doc.$createdAt,
        updated_at: doc.$updatedAt
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  /**
   * Send a chat message
   */
  async sendMessage(recipientId: string, content: string, type: 'text' | 'image' | 'video' | 'file' = 'text', url?: string): Promise<ChatMessage | null> {
    try {
      const account = await services.account.get();
      if (!account) throw new Error('Not authenticated');

      // Try XMPP first if connected
      if (this.isXMPPConnected && this.xmppManager) {
        try {
          // Get recipient's email from Appwrite
          const recipient = await database.getDocument(COLLECTIONS.USERS, recipientId);
          if (recipient.email) {
            await this.xmppManager.sendMessage(recipient.email, content);
          }
        } catch (xmppError) {
          console.warn('XMPP message failed, falling back to Appwrite:', xmppError);
        }
      }

      // Store message in Appwrite
      const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      const messageData = {
        sender_id: account.$id,
        recipient_id: recipientId,
        content,
        type,
        url,
        created_at: timestamp,
        updated_at: timestamp
      };

      const response = await database.createDocument('chat_messages', messageData);

      return {
        id: response.$id,
        content,
        sender_id: account.$id,
        recipient_id: recipientId,
        type,
        url,
        created_at: response.$createdAt,
        updated_at: response.$updatedAt
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Delete a chat message
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      await database.deleteDocument('chat_messages', messageId);
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
    try {
      const account = await services.account.get();
      if (!account) throw new Error('Not authenticated');

      // Get messages where either user is sender or recipient
      const response = await database.listDocuments('chat_messages', [
        `(sender_id=${account.$id} && recipient_id=${userId}) || (sender_id=${userId} && recipient_id=${account.$id})`,
        'orderDesc(created_at)',
        `limit(${limit})`
      ]);

      return response.documents.map((doc: AppwriteChatMessage) => ({
        id: doc.$id,
        content: doc.content,
        sender_id: doc.sender_id,
        recipient_id: doc.recipient_id,
        type: doc.type,
        url: doc.url,
        created_at: doc.$createdAt,
        updated_at: doc.$updatedAt
      }));
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  /**
   * Get recent chats
   */
  async getRecentChats(limit = 20): Promise<ChatMessage[]> {
    try {
      const account = await services.account.get();
      if (!account) throw new Error('Not authenticated');

      // Get most recent message from each chat
      const response = await database.listDocuments('chat_messages', [
        `sender_id=${account.$id} || recipient_id=${account.$id}`,
        'orderDesc(created_at)',
        `limit(${limit})`
      ]);

      // Group by chat and get most recent message
      const chatMap = new Map<string, ChatMessage>();
      response.documents.forEach((doc: AppwriteChatMessage) => {
        const chatId = doc.sender_id === account.$id ? doc.recipient_id : doc.sender_id;
        if (!chatMap.has(chatId)) {
          chatMap.set(chatId, {
            id: doc.$id,
            content: doc.content,
            sender_id: doc.sender_id,
            recipient_id: doc.recipient_id,
            type: doc.type,
            url: doc.url,
            created_at: doc.$createdAt,
            updated_at: doc.$updatedAt
          });
        }
      });

      return Array.from(chatMap.values());
    } catch (error) {
      console.error('Error getting recent chats:', error);
      return [];
    }
  }

  /**
   * Handle incoming XMPP message
   */
  private async handleXMPPMessage(msg: SimpleXMPPMessage): Promise<void> {
    try {
      // Get sender's Appwrite ID from email
      const senderResponse = await database.listDocuments(COLLECTIONS.USERS, [
        `email=${msg.from}`
      ]);

      if (senderResponse.total === 0) {
        console.warn('Unknown XMPP sender:', msg.from);
        return;
      }

      const senderId = senderResponse.documents[0].$id;
      const account = await services.account.get();
      if (!account) throw new Error('Not authenticated');

      // Store message in Appwrite
      await this.sendMessage(account.$id, msg.content);
    } catch (error) {
      console.error('Error handling XMPP message:', error);
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.xmppManager) {
      this.xmppManager.disconnect();
      this.xmppManager = null;
    }
    this.isXMPPConnected = false;
  }
}

export const chatManager = new ChatManager();
