import { db, auth } from './appwrite';
import { COLLECTIONS } from './constants';

export interface StatusUpdate {
  id: string;
  user_id: string;
  type: 'photo' | 'video' | 'text';
  content: string;
  caption?: string;
  background?: string; // For text statuses
  created_at: string;
  expires_at: string;
  views?: StatusView[];
  user?: {
    id: string;
    email: string;
  };
}

export interface StatusView {
  id: string;
  status_id: string;
  viewer_id: string;
  viewed_at: string;
}

export class StatusManager {
  async getRecentStatuses(): Promise<StatusUpdate[]> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        console.warn('Appwrite not configured, returning empty statuses');
        return [];
      }

      // Get status updates from the last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const result = await db.listDocuments(COLLECTIONS.STATUS_UPDATES, [
        `created_at>=${yesterday}`,
        'orderDesc(created_at)',
        'limit(50)'
      ]);

      // For each status, fetch the user separately
      const statusesWithUsers = await Promise.all(
        result.documents.map(async (status) => {
          try {
            const userResult = await db.getDocument(COLLECTIONS.USERS, status.user_id);
            return {
              id: status.$id,
              user_id: status.user_id,
              type: status.type,
              content: status.content,
              caption: status.caption,
              background: status.background,
              created_at: status.created_at,
              expires_at: status.expires_at,
              views: status.views || [],
              user: { id: userResult.$id, email: userResult.email }
            } as StatusUpdate;
          } catch (userError) {
            console.warn('Could not fetch user for status:', userError);
            return {
              id: status.$id,
              user_id: status.user_id,
              type: status.type,
              content: status.content,
              caption: status.caption,
              background: status.background,
              created_at: status.created_at,
              expires_at: status.expires_at,
              views: status.views || [],
              user: undefined
            } as StatusUpdate;
          }
        })
      );

      return statusesWithUsers;
    } catch (error) {
      console.error('Error fetching statuses:', error);
      return [];
    }
  }

  async createStatus(type: StatusUpdate['type'], content: string, caption?: string): Promise<StatusUpdate> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        throw new Error('Appwrite not configured');
      }

      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const statusId = `status_${currentUser.$id}_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

      const statusData = {
        user_id: currentUser.$id,
        type,
        content,
        caption,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      };

      const result = await db.createDocument(
        COLLECTIONS.STATUS_UPDATES,
        statusId,
        statusData,
        [`read("user:${currentUser.$id}")`, `write("user:${currentUser.$id}")`]
      );

      // Map the result to the StatusUpdate type
      return {
        id: result.$id,
        user_id: currentUser.$id,
        type,
        content,
        caption,
        created_at: result.created_at || new Date().toISOString(),
        expires_at: expiresAt,
        views: [],
        user: { id: currentUser.$id, email: currentUser.email }
      };
    } catch (error) {
      console.error('Error creating status:', error);
      throw error;
    }
  }

  async createTextStatus(text: string, background: string, caption?: string): Promise<StatusUpdate> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        throw new Error('Appwrite not configured');
      }

      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const statusId = `status_${currentUser.$id}_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

      const statusData = {
        user_id: currentUser.$id,
        type: 'text' as const,
        content: text,
        caption,
        background,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      };

      const result = await db.createDocument(
        COLLECTIONS.STATUS_UPDATES,
        statusId,
        statusData,
        [`read("user:${currentUser.$id}")`, `write("user:${currentUser.$id}")`]
      );

      // Map the result to the StatusUpdate type
      return {
        id: result.$id,
        user_id: currentUser.$id,
        type: 'text',
        content: text,
        caption,
        background,
        created_at: result.created_at || new Date().toISOString(),
        expires_at: expiresAt,
        views: [],
        user: { id: currentUser.$id, email: currentUser.email }
      };
    } catch (error) {
      console.error('Error creating text status:', error);
      throw error;
    }
  }

  async viewStatus(statusId: string): Promise<void> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        throw new Error('Appwrite not configured');
      }

      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const viewId = `view_${currentUser.$id}_${statusId}_${Date.now()}`;
      const viewData = {
        status_id: statusId,
        viewer_id: currentUser.$id,
        viewed_at: new Date().toISOString(),
      };

      await db.createDocument(
        COLLECTIONS.STATUS_VIEWS,
        viewId,
        viewData,
        [`read("user:${currentUser.$id}")`, `write("user:${currentUser.$id}")`]
      );
    } catch (error) {
      console.error('Error viewing status:', error);
      throw error;
    }
  }

  async deleteStatus(statusId: string): Promise<void> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        throw new Error('Appwrite not configured');
      }

      await db.deleteDocument(COLLECTIONS.STATUS_UPDATES, statusId);
    } catch (error) {
      console.error('Error deleting status:', error);
      throw error;
    }
  }
}
