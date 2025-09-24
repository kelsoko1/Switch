import { services, storage } from '../lib/appwrite';
import { StatusUpdate, statusService } from '../lib/status';
import { STORAGE_BUCKETS } from '../lib/constants';

export interface StatusView extends StatusUpdate {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

class StatusViewService {
  /**
   * Get a status by ID with user information
   */
  async getStatusById(id: string): Promise<StatusView | null> {
    try {
      const status = await statusService.getStatusById(id);
      if (!status) return null;

      const user = await services.account.get();
      if (!user) return null;

      return {
        ...status,
        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
          avatar: user.prefs?.avatar
        }
      };
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }

  /**
   * Create a new status update with media
   */
  async createStatusWithText(text: string): Promise<StatusView | null> {
    try {
      const status = await statusService.createStatus(text);
      if (!status) throw new Error('Failed to create status');

      const user = await services.account.get();
      if (!user) throw new Error('Not authenticated');

      return {
        ...status,
        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
          avatar: user.prefs?.avatar
        }
      };
    } catch (error) {
      console.error('Error creating text status:', error);
      return null;
    }
  }

  async createStatusWithMedia(file: File, caption: string): Promise<StatusView | null> {
    try {
      // Upload the file
      const fileResponse = await storage.uploadFile(STORAGE_BUCKETS.STATUS_MEDIA, file);
      const fileId = fileResponse.$id;

      // Get the file URL
      const fileUrl = storage.getFileView(STORAGE_BUCKETS.STATUS_MEDIA, fileId);
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';

      // Create the status
      const status = await statusService.createStatus(caption, fileType, fileUrl);
      if (!status) throw new Error('Failed to create status');

      const user = await services.account.get();
      if (!user) throw new Error('Not authenticated');

      return {
        ...status,
        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
          avatar: user.prefs?.avatar
        }
      };
    } catch (error) {
      console.error('Error creating status with media:', error);
      return null;
    }
  }

  /**
   * Get recent status updates with user information
   */
  async getRecentUpdates(): Promise<StatusView[]> {
    try {
      const updates = await statusService.getRecentUpdates();
      const user = await services.account.get();
      if (!user) return [];

      return updates.map(status => ({
        ...status,
        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
          avatar: user.prefs?.avatar
        }
      }));
    } catch (error) {
      console.error('Error getting recent updates:', error);
      return [];
    }
  }
}

export const statusViewService = new StatusViewService();
