import { database, storage } from '../lib/appwrite';
import { Query } from 'appwrite';
const VIDEOS_COLLECTION_ID = 'videos';
const SHORTS_COLLECTION_ID = 'shorts';
const VIDEO_STORAGE_BUCKET = 'videos';

export interface Video {
  $id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  views: number;
  likes: number;
  isPublic: boolean;
  userId: string;
  userName: string;
  userAvatar?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Short {
  $id: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  views: number;
  likes: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  $createdAt: string;
  $updatedAt: string;
}

class VideoService {
  /**
   * Upload video file to storage
   */
  async uploadVideoFile(file: File): Promise<{ fileId: string; url: string }> {
    try {
      const result = await storage.uploadFile(
        VIDEO_STORAGE_BUCKET,
        file
      );

      const url = storage.getFileView(VIDEO_STORAGE_BUCKET, result.$id);
      
      return {
        fileId: result.$id,
        url: url
      };
    } catch (error) {
      console.error('Error uploading video file:', error);
      throw new Error('Failed to upload video file');
    }
  }

  /**
   * Upload thumbnail file to storage
   */
  async uploadThumbnail(file: File): Promise<{ fileId: string; url: string }> {
    try {
      const result = await storage.uploadFile(
        VIDEO_STORAGE_BUCKET,
        file
      );

      const url = storage.getFileView(VIDEO_STORAGE_BUCKET, result.$id);
      
      return {
        fileId: result.$id,
        url: url
      };
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw new Error('Failed to upload thumbnail');
    }
  }

  /**
   * Create a new video
   */
  async createVideo(videoData: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    isPublic: boolean;
    userId: string;
    userName: string;
    userAvatar?: string;
  }): Promise<Video> {
    try {
      const document = await database.createDocument(
        VIDEOS_COLLECTION_ID,
        {
          ...videoData,
          views: 0,
          likes: 0,
          createdAt: new Date().toISOString()
        }
      );

      return document as unknown as Video;
    } catch (error) {
      console.error('Error creating video:', error);
      throw new Error('Failed to create video');
    }
  }

  /**
   * Create a new short
   */
  async createShort(shortData: {
    caption: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    userId: string;
    userName: string;
    userAvatar?: string;
  }): Promise<Short> {
    try {
      const document = await database.createDocument(
        SHORTS_COLLECTION_ID,
        {
          ...shortData,
          views: 0,
          likes: 0,
          createdAt: new Date().toISOString()
        }
      );

      return document as unknown as Short;
    } catch (error) {
      console.error('Error creating short:', error);
      throw new Error('Failed to create short');
    }
  }

  /**
   * Get all videos (public only or user's own)
   */
  async getVideos(userId?: string, limit: number = 50): Promise<Video[]> {
    try {
      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ];

      if (userId) {
        queries.push(Query.equal('userId', userId));
      } else {
        queries.push(Query.equal('isPublic', true));
      }

      const response = await database.listDocuments(
        VIDEOS_COLLECTION_ID,
        queries
      );

      return response.documents as unknown as Video[];
    } catch (error) {
      console.error('Error getting videos:', error);
      return [];
    }
  }

  /**
   * Get all shorts
   */
  async getShorts(limit: number = 50): Promise<Short[]> {
    try {
      const response = await database.listDocuments(
        SHORTS_COLLECTION_ID,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents as unknown as Short[];
    } catch (error) {
      console.error('Error getting shorts:', error);
      return [];
    }
  }

  /**
   * Get video by ID
   */
  async getVideoById(videoId: string): Promise<Video | null> {
    try {
      const document = await database.getDocument(
        VIDEOS_COLLECTION_ID,
        videoId
      );

      return document as unknown as Video;
    } catch (error) {
      console.error('Error getting video:', error);
      return null;
    }
  }

  /**
   * Get short by ID
   */
  async getShortById(shortId: string): Promise<Short | null> {
    try {
      const document = await database.getDocument(
        SHORTS_COLLECTION_ID,
        shortId
      );

      return document as unknown as Short;
    } catch (error) {
      console.error('Error getting short:', error);
      return null;
    }
  }

  /**
   * Increment video views
   */
  async incrementViews(videoId: string, isShort: boolean = false): Promise<void> {
    try {
      const collectionId = isShort ? SHORTS_COLLECTION_ID : VIDEOS_COLLECTION_ID;
      const video = await database.getDocument(
        collectionId,
        videoId
      ) as any;

      await database.updateDocument(
        collectionId,
        videoId,
        {
          views: (video.views || 0) + 1
        }
      );
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  /**
   * Toggle like on video/short
   */
  async toggleLike(videoId: string, isShort: boolean = false, increment: boolean = true): Promise<void> {
    try {
      const collectionId = isShort ? SHORTS_COLLECTION_ID : VIDEOS_COLLECTION_ID;
      const video = await database.getDocument(
        collectionId,
        videoId
      ) as any;

      await database.updateDocument(
        collectionId,
        videoId,
        {
          likes: Math.max(0, (video.likes || 0) + (increment ? 1 : -1))
        }
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<void> {
    try {
      await database.deleteDocument(
        VIDEOS_COLLECTION_ID,
        videoId
      );
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error('Failed to delete video');
    }
  }

  /**
   * Delete short
   */
  async deleteShort(shortId: string): Promise<void> {
    try {
      await database.deleteDocument(
        SHORTS_COLLECTION_ID,
        shortId
      );
    } catch (error) {
      console.error('Error deleting short:', error);
      throw new Error('Failed to delete short');
    }
  }
}

export const videoService = new VideoService();
