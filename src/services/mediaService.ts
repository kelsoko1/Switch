import { storage } from '@/lib/appwrite';
import { STORAGE_BUCKETS } from '@/lib/constants';

export interface MediaUploadResult {
  fileId: string;
  url: string;
  mimeType: string;
  size: number;
}

class MediaService {
  private storage: typeof storage;

  constructor() {
    this.storage = storage;
  }

  /**
   * Upload a media file to Appwrite Storage
   */
  async uploadMedia(
    file: File,
    bucketId: string = STORAGE_BUCKETS.STATUS_MEDIA
  ): Promise<MediaUploadResult> {
    try {
      const result = await this.storage.uploadFile(bucketId, file);

      // Get the file URL
      const fileUrl = this.storage.getFileView(bucketId, result.$id);

      return {
        fileId: result.$id,
        url: fileUrl.toString(),
        mimeType: file.type,
        size: file.size,
      };
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media');
    }
  }

  /**
   * Delete a media file from Appwrite Storage
   */
  async deleteMedia(fileId: string, bucketId: string = STORAGE_BUCKETS.STATUS_MEDIA): Promise<void> {
    try {
      await this.storage.deleteFile(bucketId, fileId);
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error('Failed to delete media');
    }
  }
}

export const mediaService = new MediaService();
