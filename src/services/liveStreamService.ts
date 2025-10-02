import { database } from '../lib/appwrite';
import { Query, ID } from 'appwrite';

const LIVE_STREAMS_COLLECTION = 'live_streams';
const STREAM_COMMENTS_COLLECTION = 'stream_comments';

export interface LiveStream {
  $id: string;
  streamId: string;
  title: string;
  streamerId: string;
  streamerName: string;
  streamerAvatar?: string;
  isLive: boolean;
  viewerCount: number;
  likeCount: number;
  startedAt: string;
  endedAt?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface StreamComment {
  $id: string;
  streamId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: string;
  $createdAt: string;
}

class LiveStreamService {
  /**
   * Create a new live stream
   */
  async createStream(streamData: {
    streamId: string;
    title: string;
    streamerId: string;
    streamerName: string;
    streamerAvatar?: string;
  }): Promise<LiveStream> {
    try {
      const document = await database.createDocument(
        LIVE_STREAMS_COLLECTION,
        {
          ...streamData,
          isLive: true,
          viewerCount: 0,
          likeCount: 0,
          startedAt: new Date().toISOString()
        }
      );

      return document as unknown as LiveStream;
    } catch (error) {
      console.error('Error creating stream:', error);
      throw new Error('Failed to create stream');
    }
  }

  /**
   * End a live stream
   */
  async endStream(streamId: string, viewerCount: number, likeCount: number): Promise<void> {
    try {
      await database.updateDocument(
        LIVE_STREAMS_COLLECTION,
        streamId,
        {
          isLive: false,
          endedAt: new Date().toISOString(),
          viewerCount,
          likeCount
        }
      );
    } catch (error) {
      console.error('Error ending stream:', error);
      throw new Error('Failed to end stream');
    }
  }

  /**
   * Get all active live streams
   */
  async getActiveStreams(limit: number = 50): Promise<LiveStream[]> {
    try {
      const response = await database.listDocuments(
        LIVE_STREAMS_COLLECTION,
        [
          Query.equal('isLive', true),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents as unknown as LiveStream[];
    } catch (error) {
      console.error('Error getting active streams:', error);
      return [];
    }
  }

  /**
   * Get stream by ID
   */
  async getStreamById(streamId: string): Promise<LiveStream | null> {
    try {
      const document = await database.getDocument(
        LIVE_STREAMS_COLLECTION,
        streamId
      );

      return document as unknown as LiveStream;
    } catch (error) {
      console.error('Error getting stream:', error);
      return null;
    }
  }

  /**
   * Update viewer count
   */
  async updateViewerCount(streamId: string, viewerCount: number): Promise<void> {
    try {
      await database.updateDocument(
        LIVE_STREAMS_COLLECTION,
        streamId,
        {
          viewerCount
        }
      );
    } catch (error) {
      console.error('Error updating viewer count:', error);
    }
  }

  /**
   * Update like count
   */
  async updateLikeCount(streamId: string, likeCount: number): Promise<void> {
    try {
      await database.updateDocument(
        LIVE_STREAMS_COLLECTION,
        streamId,
        {
          likeCount
        }
      );
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  }

  /**
   * Add a comment to a stream
   */
  async addComment(commentData: {
    streamId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    message: string;
  }): Promise<StreamComment> {
    try {
      const document = await database.createDocument(
        STREAM_COMMENTS_COLLECTION,
        {
          ...commentData,
          timestamp: new Date().toISOString()
        }
      );

      return document as unknown as StreamComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  /**
   * Get comments for a stream
   */
  async getStreamComments(streamId: string, limit: number = 100): Promise<StreamComment[]> {
    try {
      const response = await database.listDocuments(
        STREAM_COMMENTS_COLLECTION,
        [
          Query.equal('streamId', streamId),
          Query.orderAsc('$createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents as unknown as StreamComment[];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  /**
   * Delete a stream
   */
  async deleteStream(streamId: string): Promise<void> {
    try {
      await database.deleteDocument(
        LIVE_STREAMS_COLLECTION,
        streamId
      );
    } catch (error) {
      console.error('Error deleting stream:', error);
      throw new Error('Failed to delete stream');
    }
  }
}

export const liveStreamService = new LiveStreamService();
