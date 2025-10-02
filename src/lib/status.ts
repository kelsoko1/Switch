import { database, services } from './appwrite';
import { COLLECTIONS } from './constants';
import { Models, Query } from 'appwrite';

export interface StatusUpdate {
  id: string;
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'video';
  url?: string;
  likes: number;
  comments: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

interface AppwriteStatus extends Models.Document {
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'video';
  url?: string;
  likes: number;
  comments: number;
  expires_at: string;
}

export class StatusService {
  /**
   * Get a status by ID
   */
  async getStatusById(id: string): Promise<StatusUpdate | null> {
    try {
      const response = await database.getDocument(COLLECTIONS.STATUS_UPDATES, id) as AppwriteStatus;
      return {
        id: response.$id,
        user_id: response.user_id,
        content: response.content,
        type: response.type,
        url: response.url,
        likes: response.likes,
        comments: response.comments,
        created_at: response.$createdAt,
        updated_at: response.$updatedAt,
        expires_at: response.expires_at
      };
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }

  /**
   * Get recent status updates
   * @param limit Maximum number of statuses to return
   * @param afterDate Only return statuses after this date (default: 24 hours ago)
   */
  async getRecentStatuses(limit = 10, afterDate?: Date): Promise<StatusUpdate[]> {
    try {
      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ];
      
      // Add date filter if provided
      if (afterDate) {
        queries.push(Query.greaterThan('$createdAt', afterDate.toISOString()));
      }
      
      const response = await database.listDocuments(
        COLLECTIONS.STATUS_UPDATES,
        queries
      ) as unknown as { documents: AppwriteStatus[] };

      return response.documents.map((status: AppwriteStatus) => ({
        id: status.$id,
        user_id: status.user_id,
        content: status.content,
        type: status.type,
        url: status.url,
        likes: status.likes,
        comments: status.comments,
        created_at: status.$createdAt,
        updated_at: status.$updatedAt,
        expires_at: status.expires_at
      }));
    } catch (error: any) {
      // Check if the error is due to missing collection
      if (error?.code === 404 || error?.message?.includes('Collection')) {
        console.warn('Status updates collection not found. Please run the database initialization script.');
        return [];
      }
      console.error('Error getting recent status updates:', error);
      return [];
    }
  }

  /**
   * Create a new status update
   */
  async createStatus(
    content: string, 
    type: 'text' | 'image' | 'video' = 'text',
    mediaUrl?: string
  ): Promise<StatusUpdate | null> {
    try {
      const user = await services.account.get();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setHours(expiresAt.getHours() + 24); // Status expires in 24 hours

      const response = await database.createDocument(
        COLLECTIONS.STATUS_UPDATES,
        {
          user_id: user.$id,
          content,
          type,
          url: mediaUrl,
          likes: 0,
          comments: 0,
          expires_at: expiresAt.toISOString(),
          $permissions: [
            `read(\"user:${user.$id}\")`,
            `write(\"user:${user.$id}\")`,
            `delete(\"user:${user.$id}\")`
          ]
        },
        [`user:${user.$id}`]
      ) as AppwriteStatus;

      return {
        id: response.$id,
        user_id: user.$id,
        content,
        type,
        url: mediaUrl,
        likes: 0,
        comments: 0,
        created_at: response.$createdAt,
        updated_at: response.$updatedAt,
        expires_at: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('Error creating status update:', error);
      return null;
    }
  }

  /**
   * Update a status
   */
  async updateStatus(id: string, content: string): Promise<StatusUpdate | null> {
    try {
      const account = await services.account.get();
      if (!account) throw new Error('Not authenticated');

      const response = await database.updateDocument(COLLECTIONS.STATUS_UPDATES, id, {
        content,
        updated_at: new Date().toISOString()
      }) as AppwriteStatus;

      return {
        id: response.$id,
        user_id: response.user_id,
        content: response.content,
        type: response.type,
        url: response.url,
        likes: response.likes,
        comments: response.comments,
        created_at: response.$createdAt,
        updated_at: response.$updatedAt,
        expires_at: response.expires_at
      };
    } catch (error) {
      console.error('Error updating status:', error);
      return null;
    }
  }

  /**
   * Delete a status
   */
  async deleteStatus(id: string): Promise<boolean> {
    try {
      const account = await services.account.get();
      if (!account) throw new Error('Not authenticated');

      await database.deleteDocument(COLLECTIONS.STATUS_UPDATES, id);
      return true;
    } catch (error) {
      console.error('Error deleting status:', error);
      return false;
    }
  }

  /**
   * Like a status
   */
  async likeStatus(statusId: string, userId: string): Promise<boolean> {
    try {
      // Check if already liked
      const response = await database.listDocuments(
        COLLECTIONS.STATUS_VIEWS, // Using STATUS_VIEWS as a fallback since STATUS_LIKES doesn't exist
        [`status_id=${statusId}`, `user_id=${userId}`]
      ) as unknown as { documents: any[]; total: number };

      if (response.total > 0) {
        return false;
      }

      // Create like
      await database.createDocument(COLLECTIONS.STATUS_VIEWS, {
        status_id: statusId,
        user_id: userId
      });

      // Increment likes count
      await database.updateDocument(COLLECTIONS.STATUS_UPDATES, statusId, {
        likes: '+1'
      });

      return true;
    } catch (error) {
      console.error('Error liking status:', error);
      return false;
    }
  }

  /**
   * Unlike a status
   */
  async unlikeStatus(statusId: string, userId: string): Promise<boolean> {
    try {
      // Find and delete like
      const response = await database.listDocuments(
        COLLECTIONS.STATUS_VIEWS, // Using STATUS_VIEWS as a fallback since STATUS_LIKES doesn't exist
        [`status_id=${statusId}`, `user_id=${userId}`]
      ) as unknown as { documents: any[]; total: number };

      if (response.total === 0) {
        return false;
      }

      await database.deleteDocument(
        COLLECTIONS.STATUS_VIEWS, // Using STATUS_VIEWS as a fallback since STATUS_LIKES doesn't exist
        response.documents[0].$id
      );

      // Decrement likes count
      await database.updateDocument(COLLECTIONS.STATUS_UPDATES, statusId, {
        likes: '-1'
      });

      return true;
    } catch (error) {
      console.error('Error unliking status:', error);
      return false;
    }
  }
}

export const statusService = new StatusService();
