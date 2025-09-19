import { appwrite, storage } from '../lib/appwrite';
import { StatusManager } from '../lib/status';
import { STORAGE_BUCKETS } from '../lib/constants';

// Define the shape of the status object
export interface Status {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  mediaUrl: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
  views: string[];
  type: 'photo' | 'video' | 'text';
  background?: string; // For text statuses
}

// Create an instance of the StatusManager
const statusManager = new StatusManager();

// Status service with typed methods
export const statusService = {
  // Get all statuses from users that the current user follows
  async getStatuses(): Promise<Status[]> {
    try {
      console.log('Fetching statuses from Appwrite...');
      const statusUpdates = await statusManager.getRecentStatuses();
      
      // Convert StatusUpdate to Status format
      return statusUpdates.map(update => ({
        id: update.id,
        userId: update.user_id,
        username: update.user?.email?.split('@')[0] || 'Unknown',
        avatar: update.user?.id ? `https://ui-avatars.com/api/?name=${update.user.email}&background=random` : '',
        mediaUrl: update.content,
        caption: update.caption || '',
        createdAt: update.created_at,
        updatedAt: update.created_at,
        views: update.views?.map(view => view.viewer_id) || [],
        type: update.type,
        background: update.background
      }));
    } catch (error: any) {
      console.error('Error fetching statuses:', error);
      return []; // Return empty array on error
    }
  },

  // Get a single status by ID
  async getStatusById(id: string): Promise<Status> {
    try {
      // Get the status from Appwrite
      const statusUpdate = await appwrite.getDocument('status_updates', id);
      
      // Get the user information
      const user = await appwrite.getDocument('users', statusUpdate.user_id);
      
      return {
        id: statusUpdate.$id,
        userId: statusUpdate.user_id,
        username: user.name || user.email.split('@')[0],
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`,
        mediaUrl: statusUpdate.content,
        caption: statusUpdate.caption || '',
        createdAt: statusUpdate.created_at,
        updatedAt: statusUpdate.created_at,
        views: statusUpdate.views || [],
        type: statusUpdate.type,
        background: statusUpdate.background
      };
    } catch (error: any) {
      console.error(`Error fetching status ${id}:`, error);
      throw new Error('Failed to fetch status');
    }
  },

  // Create a new media status (photo or video)
  async createStatus(
    file: File,
    caption?: string
  ): Promise<Status> {
    try {
      console.log('Creating new status with Appwrite...');
      
      // First, upload the file to storage
      const fileType = file.type.startsWith('image/') ? 'photo' : 'video';
      
      // Create a unique file ID
      const fileId = `status_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Upload the file to Appwrite storage
      await storage.createFile(
        STORAGE_BUCKETS.STATUS_MEDIA,
        fileId,
        file
      );
      
      // Get the file URL
      const fileUrl = storage.getFileView(STORAGE_BUCKETS.STATUS_MEDIA, fileId).toString();
      
      // Create the status in Appwrite
      const statusUpdate = await statusManager.createStatus(
        fileType,
        fileUrl,
        caption
      );
      
      // Return the status in the expected format
      return {
        id: statusUpdate.id,
        userId: statusUpdate.user_id,
        username: statusUpdate.user?.email?.split('@')[0] || 'Unknown',
        avatar: statusUpdate.user?.id ? `https://ui-avatars.com/api/?name=${statusUpdate.user.email}&background=random` : '',
        mediaUrl: statusUpdate.content,
        caption: caption || '',
        createdAt: statusUpdate.created_at,
        updatedAt: statusUpdate.created_at,
        views: [],
        type: statusUpdate.type
      };
    } catch (error: any) {
      console.error('Error creating status:', error);
      throw new Error(error.message || 'Failed to create status');
    }
  },

  // Create a new text status
  async createTextStatus(
    text: string,
    background: string,
    caption?: string
  ): Promise<Status> {
    try {
      console.log('Creating new text status with Appwrite...');
      
      // Create the status in Appwrite
      const statusUpdate = await statusManager.createTextStatus(
        text,
        background,
        caption
      );
      
      // Return the status in the expected format
      return {
        id: statusUpdate.id,
        userId: statusUpdate.user_id,
        username: statusUpdate.user?.email?.split('@')[0] || 'Unknown',
        avatar: statusUpdate.user?.id ? `https://ui-avatars.com/api/?name=${statusUpdate.user.email}&background=random` : '',
        mediaUrl: statusUpdate.content,
        caption: caption || '',
        createdAt: statusUpdate.created_at,
        updatedAt: statusUpdate.created_at,
        views: [],
        type: 'text',
        background: background
      };
    } catch (error: any) {
      console.error('Error creating text status:', error);
      throw new Error(error.message || 'Failed to create text status');
    }
  },

  // Mark a status as viewed
  async viewStatus(statusId: string): Promise<void> {
    try {
      await statusManager.viewStatus(statusId);
      console.log(`Status ${statusId} viewed and recorded in Appwrite`);
    } catch (error: any) {
      console.error('Error viewing status:', error);
      // Don't throw error for view status to avoid breaking the UI
    }
  },

  // Get user's own statuses
  async getMyStatuses(): Promise<Status[]> {
    try {
      // Get the current user
      const currentUser = await appwrite.getAccount();
      if (!currentUser) {
        return [];
      }
      
      // Get all statuses
      const allStatuses = await this.getStatuses();
      
      // Filter to only include the current user's statuses
      return allStatuses.filter(status => status.userId === currentUser.$id);
    } catch (error: any) {
      console.error('Error fetching my statuses:', error);
      // Return empty array instead of throwing to prevent UI breakage
      return [];
    }
  },

  // Delete a status
  async deleteStatus(statusId: string): Promise<void> {
    try {
      await statusManager.deleteStatus(statusId);
      console.log(`Status ${statusId} deleted from Appwrite`);
    } catch (error: any) {
      console.error(`Error deleting status ${statusId}:`, error);
      throw new Error('Failed to delete status');
    }
  },
};
