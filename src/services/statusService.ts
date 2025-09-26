import { services } from '../lib/appwrite';
import { StatusUpdate, statusService } from '../lib/status';
import { mediaService } from './mediaService';

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
   * Get recent status updates with user information
   */
  async getRecentStatuses(limit = 20): Promise<StatusView[]> {
    try {
      // Only get statuses from the last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const statuses = await statusService.getRecentStatuses(limit, twentyFourHoursAgo);
      if (!statuses.length) return [];

      const user = await services.account.get();
      if (!user) return [];

      return statuses.map((status: StatusUpdate) => ({
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

  /**
   * Create a new status with media
   */
  async createStatusWithMedia(
    caption: string,
    mediaType: 'image' | 'video',
    file: File
  ): Promise<StatusView | null> {
    try {
      const user = await services.account.get();
      if (!user) throw new Error('User not authenticated');

      // Upload media file
      const media = await mediaService.uploadMedia(file);

      // Create status with media reference
      const status = await statusService.createStatus(
        caption,
        mediaType,
        media.url
      );

      if (!status) return null;

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
      throw error;
    }
  }

  /**
   * Create a new text status
   */
  async createStatusWithText(caption: string): Promise<StatusView | null> {
    try {
      const status = await statusService.createStatus(caption, 'text');
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

  /**
   * Get recent status updates with user information
   */
  async getRecentUpdates(limit = 20): Promise<StatusView[]> {
    try {
      // Only get statuses from the last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const statuses = await statusService.getRecentStatuses(limit, twentyFourHoursAgo);
      if (!statuses.length) return [];

      const user = await services.account.get();
      if (!user) return [];

      return statuses.map((status: StatusUpdate) => ({
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
