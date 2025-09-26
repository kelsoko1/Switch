// src/services/appwrite/chatService.ts
import { Query, Models, ID, Client, type Models as AppwriteModels } from 'appwrite';
import { AppwriteService } from './appwriteService';
import { appwriteConfig } from '@/config/appwrite';

// Collection name for chat messages
const CHAT_MESSAGES_COLLECTION = 'chat_messages';

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'audio';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'error';

export interface MessageMetadata {
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface Message extends Models.Document {
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  receiver_id?: string;
  group_id?: string;
  type: MessageType;
  status: MessageStatus;
  reply_to?: string;
  reactions?: Record<string, string[]>;
  metadata?: MessageMetadata;
  read_by?: string[];
  deleted?: boolean;
}

export class ChatError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export class ChatService extends AppwriteService {
  private static instance: ChatService;
  private subscriptions: Map<string, () => void> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private validateMessage(message: Partial<Message>): void {
    if (!message.content?.trim()) {
      throw new ChatError('MISSING_CONTENT', 'Message content is required');
    }
    if (!message.sender_id) {
      throw new ChatError('MISSING_SENDER', 'Sender ID is required');
    }
    if (!message.type) {
      throw new ChatError('MISSING_TYPE', 'Message type is required');
    }
    if (!message.group_id && !message.receiver_id) {
      throw new ChatError('MISSING_RECIPIENT', 'Either group_id or receiver_id is required');
    }
  }

  async sendMessage(message: Omit<Message, keyof Models.Document>): Promise<Message> {
    try {
      this.validateMessage(message);
      
      const newMessage = await this.databases.createDocument<Message>(
        this.databaseId,
        CHAT_MESSAGES_COLLECTION,
        ID.unique(),
        {
          ...message,
          status: 'sent' as MessageStatus,
          read_by: [message.sender_id],
          reactions: {},
          deleted: false
        }
      );

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new ChatError(
        'SEND_MESSAGE_FAILED', 
        'Failed to send message', 
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async updateMessage(
    messageId: string,
    updates: Partial<Omit<Message, keyof Models.Document>>
  ): Promise<Message> {
    try {
      if (!messageId) {
        throw new ChatError('INVALID_MESSAGE_ID', 'Message ID is required');
      }

return await this.databases.updateDocument<Message>(
        this.databaseId,
        CHAT_MESSAGES_COLLECTION,
        messageId,
        updates
      );
    } catch (error) {
      console.error('Error updating message:', error);
      throw new ChatError(
        'UPDATE_MESSAGE_FAILED',
        'Failed to update message',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const message = await this.getMessage(messageId);
      
      // Only allow sender or admin to delete
      if (message.sender_id !== userId) {
        throw new ChatError('UNAUTHORIZED', 'Only the message sender can delete this message');
      }

      // Soft delete by marking as deleted
      await this.updateMessage(messageId, { deleted: true });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new ChatError(
        'DELETE_MESSAGE_FAILED',
        'Failed to delete message',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async getMessage(messageId: string): Promise<Message> {
    try {
      return await this.databases.getDocument<Message>(
        this.databaseId,
        CHAT_MESSAGES_COLLECTION,
        messageId
      );
    } catch (error) {
      console.error('Error getting message:', error);
      throw new ChatError(
        'GET_MESSAGE_FAILED',
        'Failed to get message',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async getMessages(params: {
    groupId?: string;
    userId?: string;
    limit?: number;
    before?: string;
    after?: string;
  }): Promise<{ documents: Message[]; total: number }> {
    try {
      const limit = Math.min(params.limit || 50, 100);
      const queries = [
        Query.limit(limit),
        Query.orderDesc('$createdAt'),
        Query.equal('deleted', false)
      ];
      
      if (params.groupId) {
        queries.push(Query.equal('group_id', params.groupId));
      } else if (params.userId) {
        queries.push(
          Query.or([
            Query.equal('receiver_id', params.userId),
            Query.equal('sender_id', params.userId)
          ])
        );
      } else {
        throw new ChatError('INVALID_PARAMS', 'Either groupId or userId must be provided');
      }

      if (params.before) {
        queries.push(Query.cursorBefore(params.before));
      } else if (params.after) {
        queries.push(Query.cursorAfter(params.after));
      }

      return await this.databases.listDocuments<Message>(
        this.databaseId,
        CHAT_MESSAGES_COLLECTION,
        queries
      );
    } catch (error) {
      console.error('Error getting messages:', error);
      throw new ChatError(
        'GET_MESSAGES_FAILED',
        'Failed to get messages',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    try {
      const message = await this.getMessage(messageId);
      
      // If already read by this user, return
      if (message.read_by?.includes(userId)) {
        return message;
      }

      // Add user to read_by array
      const updatedReadBy = [...(message.read_by || []), userId];
      
      return await this.updateMessage(messageId, {
        status: 'read',
        read_by: [...new Set(updatedReadBy)] // Ensure no duplicates
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new ChatError(
        'MARK_AS_READ_FAILED',
        'Failed to mark message as read',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async addReaction(
    messageId: string, 
    userId: string, 
    reaction: string
  ): Promise<Message> {
    try {
      const message = await this.getMessage(messageId);
      const reactions = { ...(message.reactions || {}) };
      
      // Initialize reaction array if it doesn't exist
      if (!reactions[reaction]) {
        reactions[reaction] = [];
      }
      
      // Add user to reaction if not already there
      if (!reactions[reaction].includes(userId)) {
        reactions[reaction].push(userId);
      }

      return await this.updateMessage(messageId, { reactions });
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw new ChatError(
        'ADD_REACTION_FAILED',
        'Failed to add reaction',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async removeReaction(
    messageId: string, 
    userId: string, 
    reaction: string
  ): Promise<Message> {
    try {
      const message = await this.getMessage(messageId);
      const reactions = { ...(message.reactions || {}) };
      
      // Remove user from reaction if exists
      if (reactions[reaction]) {
        reactions[reaction] = reactions[reaction].filter(id => id !== userId);
        
        // Remove reaction if no users left
        if (reactions[reaction].length === 0) {
          delete reactions[reaction];
        }
      }

      return await this.updateMessage(messageId, { reactions });
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw new ChatError(
        'REMOVE_REACTION_FAILED',
        'Failed to remove reaction',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Real-time subscriptions
  async subscribeToMessages(
    channel: { groupId?: string; userId?: string },
    callback: (message: Message) => void
  ): Promise<() => void> {
    if (!channel.groupId && !channel.userId) {
      throw new ChatError('INVALID_CHANNEL', 'Either groupId or userId must be provided');
    }

    const queries: string[] = [];

    if (channel.groupId) {
      queries.push(Query.equal('group_id', channel.groupId));
    } else if (channel.userId) {
      queries.push(
        Query.or([
          Query.equal('receiver_id', channel.userId),
          Query.equal('sender_id', channel.userId)
        ])
      );
    }

    const subscriptionKey = channel.groupId ? `group_${channel.groupId}` : `user_${channel.userId}`;

    // Unsubscribe if already subscribed
    if (this.subscriptions.has(subscriptionKey)) {
      const existingUnsubscribe = this.subscriptions.get(subscriptionKey);
      if (existingUnsubscribe) existingUnsubscribe();
      this.subscriptions.delete(subscriptionKey);
    }

    // Create a new client for real-time subscriptions
    const client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    // Subscribe to new messages
    const subscription = client.subscribe<AppwriteModels.Document & Message>(
      `databases.${this.databaseId}.collections.${CHAT_MESSAGES_COLLECTION}.documents`,
      (response) => {
        if (response.events.includes(`databases.${this.databaseId}.collections.${CHAT_MESSAGES_COLLECTION}.documents.*.create`)) {
          callback(response.payload as Message);
        }
      }
    );

    // Store the unsubscribe function
    const unsubscribe = () => {
      if ('unsubscribe' in subscription && typeof subscription.unsubscribe === 'function') {
        (subscription as { unsubscribe: () => void }).unsubscribe();
      }
      this.subscriptions.delete(subscriptionKey);
    };

    this.subscriptions.set(subscriptionKey, unsubscribe);
    
    // Return the unsubscribe function
    return () => {
      const unsub = this.subscriptions.get(subscriptionKey);
      if (unsub) {
        unsub();
      }
    };
  }

  // Clean up all subscriptions
  cleanup() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
}

export const chatService = ChatService.getInstance();