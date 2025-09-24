import { database, services } from './appwrite';
import { COLLECTIONS } from './constants';
import { Models } from 'appwrite';

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
}

interface AppwriteStatus extends Models.Document {
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'video';
  url?: string;
  likes: number;
  comments: number;
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
        updated_at: response.$updatedAt
      };
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }

  /**
   * Get recent status updates
   */
  async getRecentUpdates(): Promise<StatusUpdate[]> {
    try {
      // Get status updates from the last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const response = await database.listDocuments(COLLECTIONS.STATUS_UPDATES, [
        `created_at>=${yesterday}`,
        'orderDesc(created_at)',
        'limit(50)'
      ]);

      return response.documents.map((status: AppwriteStatus) => ({
        id: status.$id,
        user_id: status.user_id,
        content: status.content,
        type: status.type,
        url: status.url,
        likes: status.likes,
        comments: status.comments,
        created_at: status.$createdAt,
        updated_at: status.$updatedAt
      }));
    } catch (error) {
      console.error('Error getting recent status updates:', error);
      return [];
    }
  }

  /**
   * Create a new status update
   */
  async createStatus(content: string, type: 'text' | 'image' | 'video' = 'text', url?: string): Promise<StatusUpdate | null> {
    try {
      const account = await services.account.get();
      if (!account) throw new Error('Not authenticated');

      const response = await database.createDocument(COLLECTIONS.STATUS_UPDATES, {
        user_id: account.$id,
        content,
        type,
        url,
        likes: 0,
        comments: 0
      }) as AppwriteStatus;

      return {
        id: response.$id,
        user_id: account.$id,
        content,
        type,
        url,
        likes: 0,
        comments: 0,
        created_at: response.$createdAt,
        updated_at: response.$updatedAt
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
        updated_at: response.$updatedAt
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
  async likeStatus(id: string): Promise<boolean> {
    try {
      const account = await services.account.get();
      if (!account) throw new Error('Not authenticated');

      // Check if already liked
      const existingLike = await database.listDocuments(COLLECTIONS.STATUS_LIKES, [
        `user_id=${account.$id}`,
        `status_id=${id}`
      ]);

      if (existingLike.total > 0) {
        return false;
      }

      // Create like
      await database.createDocument(COLLECTIONS.STATUS_LIKES, {
        status_id: id,
        user_id: account.$id
      });

      // Increment likes count
      await database.updateDocument(COLLECTIONS.STATUS_UPDATES, id, {
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
  async unlikeStatus(id: string): Promise<boolean> {
    try {
      const account = await services.account.get();
      if (!account) throw new Error('Not authenticated');

      // Find and delete like
      const existingLike = await database.listDocuments(COLLECTIONS.STATUS_LIKES, [
        `user_id=${account.$id}`,
        `status_id=${id}`
      ]);

      if (existingLike.total === 0) {
        return false;
      }

      await database.deleteDocument(COLLECTIONS.STATUS_LIKES, existingLike.documents[0].$id);

      // Decrement likes count
      await database.updateDocument(COLLECTIONS.STATUS_UPDATES, id, {
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
