import { ID, Query, Storage } from 'appwrite';
import { appwriteConfig } from '@/config/appwrite';
import { AppwriteService } from './appwriteService';

export interface Message {
    $id: string;
    sender_id: string;
    receiver_id?: string;
    group_id?: string;
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file';
    status: 'sent' | 'delivered' | 'read';
    media_url?: string;
    reply_to?: string;
    reactions?: { [userId: string]: string };
    sent_at: string;
    delivered_at?: string;
    read_at?: string;
}

export interface MessageQuery {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderType?: 'asc' | 'desc';
}

class MessageService extends AppwriteService {
    private readonly MEDIA_BUCKET = 'messages_media';

    constructor() {
        super();
        this.initializeStorage();
    }

    private async initializeStorage() {
        try {
            // Create media bucket if it doesn't exist
            // Note: Bucket creation is typically a server-side operation
            // For frontend, we'll just assume it exists or will be created
            console.log('Storage initialized, assuming media bucket exists');
        } catch (error) {
            console.error('Error initializing storage:', error);
        }
    }

    // Send a direct message
    async sendMessage(
        senderId: string,
        receiverId: string,
        content: string,
        type: Message['type'] = 'text',
        replyTo?: string,
        mediaFile?: File
    ): Promise<Message> {
        try {
            let mediaUrl;
            if (mediaFile && type !== 'text') {
                const storage = new Storage(this.client);
                const file = await storage.createFile(
                    this.MEDIA_BUCKET,
                    ID.unique(),
                    mediaFile
                );
                mediaUrl = file.$id;
            }

            const message = await this.databases.createDocument(
                appwriteConfig.databaseId,
                'messages',
                ID.unique(),
                {
                    sender_id: senderId,
                    receiver_id: receiverId,
                    content,
                    type,
                    status: 'sent',
                    media_url: mediaUrl,
                    reply_to: replyTo,
                    reactions: {},
                    sent_at: new Date().toISOString()
                }
            );

            return message as unknown as Message;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    // Send a group message
    async sendGroupMessage(
        senderId: string,
        groupId: string,
        content: string,
        type: Message['type'] = 'text',
        replyTo?: string,
        mediaFile?: File
    ): Promise<Message> {
        try {
            let mediaUrl;
            if (mediaFile && type !== 'text') {
                const storage = new Storage(this.client);
                const file = await storage.createFile(
                    this.MEDIA_BUCKET,
                    ID.unique(),
                    mediaFile
                );
                mediaUrl = file.$id;
            }

            const message = await this.databases.createDocument(
                appwriteConfig.databaseId,
                'messages',
                ID.unique(),
                {
                    sender_id: senderId,
                    group_id: groupId,
                    content,
                    type,
                    status: 'sent',
                    media_url: mediaUrl,
                    reply_to: replyTo,
                    reactions: {},
                    sent_at: new Date().toISOString()
                }
            );

            return message as unknown as Message;
        } catch (error) {
            console.error('Error sending group message:', error);
            throw error;
        }
    }

    // Get chat history between two users
    async getChatHistory(
        userId1: string,
        userId2: string,
        query?: MessageQuery
    ): Promise<Message[]> {
        try {
            const messages = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                'messages',
                [
                    Query.equal('sender_id', [userId1, userId2]),
                    Query.equal('receiver_id', [userId1, userId2]),
                    Query.orderDesc('sent_at'),
                    ...(query?.limit ? [Query.limit(query.limit)] : []),
                    ...(query?.offset ? [Query.offset(query.offset)] : [])
                ]
            );

            return messages.documents as unknown as Message[];
        } catch (error) {
            console.error('Error getting chat history:', error);
            throw error;
        }
    }

    // Get group messages
    async getGroupMessages(
        groupId: string,
        query?: MessageQuery
    ): Promise<Message[]> {
        try {
            const messages = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                'messages',
                [
                    Query.equal('group_id', groupId),
                    Query.orderDesc('sent_at'),
                    ...(query?.limit ? [Query.limit(query.limit)] : []),
                    ...(query?.offset ? [Query.offset(query.offset)] : [])
                ]
            );

            return messages.documents as unknown as Message[];
        } catch (error) {
            console.error('Error getting group messages:', error);
            throw error;
        }
    }

    // Mark message as delivered
    async markAsDelivered(messageId: string): Promise<Message> {
        try {
            const message = await this.databases.updateDocument(
                appwriteConfig.databaseId,
                'messages',
                messageId,
                {
                    status: 'delivered',
                    delivered_at: new Date().toISOString()
                }
            );

            return message as unknown as Message;
        } catch (error) {
            console.error('Error marking message as delivered:', error);
            throw error;
        }
    }

    // Mark message as read
    async markAsRead(messageId: string): Promise<Message> {
        try {
            const message = await this.databases.updateDocument(
                appwriteConfig.databaseId,
                'messages',
                messageId,
                {
                    status: 'read',
                    read_at: new Date().toISOString()
                }
            );

            return message as unknown as Message;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }

    // Add reaction to message
    async addReaction(
        messageId: string,
        userId: string,
        reaction: string
    ): Promise<Message> {
        try {
            const message = await this.databases.getDocument(
                appwriteConfig.databaseId,
                'messages',
                messageId
            ) as unknown as Message;

            const reactions = message.reactions || {};
            reactions[userId] = reaction;

            const updatedMessage = await this.databases.updateDocument(
                appwriteConfig.databaseId,
                'messages',
                messageId,
                { reactions }
            );

            return updatedMessage as unknown as Message;
        } catch (error) {
            console.error('Error adding reaction:', error);
            throw error;
        }
    }

    // Remove reaction from message
    async removeReaction(messageId: string, userId: string): Promise<Message> {
        try {
            const message = await this.databases.getDocument(
                appwriteConfig.databaseId,
                'messages',
                messageId
            ) as unknown as Message;

            const reactions = message.reactions || {};
            delete reactions[userId];

            const updatedMessage = await this.databases.updateDocument(
                appwriteConfig.databaseId,
                'messages',
                messageId,
                { reactions }
            );

            return updatedMessage as unknown as Message;
        } catch (error) {
            console.error('Error removing reaction:', error);
            throw error;
        }
    }

    // Delete message
    async deleteMessage(messageId: string): Promise<void> {
        try {
            const message = await this.databases.getDocument(
                appwriteConfig.databaseId,
                'messages',
                messageId
            ) as unknown as Message;

            // Delete media file if exists
            if (message.media_url) {
                const storage = new Storage(this.client);
                await storage.deleteFile(this.MEDIA_BUCKET, message.media_url);
            }

            await this.databases.deleteDocument(
                appwriteConfig.databaseId,
                'messages',
                messageId
            );
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    // Get message by ID
    async getMessage(messageId: string): Promise<Message> {
        try {
            const message = await this.databases.getDocument(
                appwriteConfig.databaseId,
                'messages',
                messageId
            );

            return message as unknown as Message;
        } catch (error) {
            console.error('Error getting message:', error);
            throw error;
        }
    }

    // Subscribe to new messages
    subscribeToMessages(callback: (message: Message) => void): () => void {
        const unsubscribe = this.client.subscribe(
            `databases.${appwriteConfig.databaseId}.collections.messages.documents`,
            (response: any) => {
                callback(response.payload as Message);
            }
        );

        return unsubscribe;
    }

    // Get media URL
    getMediaUrl(fileId: string): string {
        try {
            const filePreview = this.storage.getFilePreview(this.MEDIA_BUCKET, fileId);
            // Fix for href not existing on string
            return filePreview.toString();
        } catch (error) {
            console.error('Error getting media URL:', error);
            return '';
        }
    }
}

export const messageService = new MessageService();
