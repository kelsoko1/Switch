const AppwriteUtils = require('../appwrite-utils');

class StatusManager extends AppwriteUtils {
    constructor() {
        super();
        this.mediaBucketId = 'status_media';
        this.statusCollectionId = 'statuses';
    }

    /**
     * Create a new status post
     * @param {string} userId - The ID of the user creating the status
     * @param {string} content - Text content of the status
     * @param {File} [mediaFile] - Optional media file to attach
     * @returns {Promise<Object>} Created status document
     */
    async createStatus(userId, content, mediaFile = null) {
        try {
            let mediaUrl = null;
            let mediaType = null;
            
            // Upload media if provided
            if (mediaFile) {
                const media = await this.uploadFile(this.mediaBucketId, mediaFile);
                mediaUrl = this.getFileUrl(this.mediaBucketId, media.$id);
                mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'video';
            }
            
            // Create status document
            const statusData = {
                userId,
                content,
                mediaUrl,
                mediaType,
                likes: 0,
                comments: 0,
                isPublic: true,
                createdAt: new Date().toISOString()
            };
            
            const status = await this.createDocument(this.statusCollectionId, statusData);
            console.log(`Status created: ${status.$id}`);
            return status;
            
        } catch (error) {
            console.error('Error creating status:', error);
            throw error;
        }
    }

    /**
     * Get a user's status feed
     * @param {string} userId - The ID of the user
     * @param {number} limit - Number of statuses to return
     * @param {number} offset - Pagination offset
     * @returns {Promise<Array>} Array of status documents
     */
    async getUserFeed(userId, limit = 20, offset = 0) {
        try {
            const queries = [
                this.constructor.query('userId', 'equal', userId),
                this.constructor.query('isPublic', 'equal', true),
                this.constructor.query('orderDesc', 'createdAt'),
                this.constructor.query('limit', limit),
                this.constructor.query('offset', offset)
            ];
            
            return await this.listDocuments(this.statusCollectionId, queries);
            
        } catch (error) {
            console.error('Error fetching user feed:', error);
            throw error;
        }
    }

    /**
     * Like a status
     * @param {string} statusId - The ID of the status
     * @param {string} userId - The ID of the user liking the status
     */
    async likeStatus(statusId, userId) {
        try {
            // In a real app, you might want to track who liked what
            await this.databases.updateDocument(
                this.databaseId,
                this.statusCollectionId,
                statusId,
                {
                    likes: this.constructor.increment(1)
                }
            );
            
            console.log(`Status ${statusId} liked by user ${userId}`);
            
        } catch (error) {
            console.error('Error liking status:', error);
            throw error;
        }
    }

    /**
     * Delete a status and its associated media
     * @param {string} statusId - The ID of the status to delete
     */
    async deleteStatus(statusId) {
        try {
            // Get the status first
            const status = await this.databases.getDocument(
                this.databaseId,
                this.statusCollectionId,
                statusId
            );
            
            // Delete associated media if exists
            if (status.mediaUrl) {
                const fileId = this.extractFileIdFromUrl(status.mediaUrl);
                if (fileId) {
                    await this.deleteFile(this.mediaBucketId, fileId)
                        .catch(err => console.warn('Could not delete media file:', err));
                }
            }
            
            // Delete the status document
            await this.databases.deleteDocument(
                this.databaseId,
                this.statusCollectionId,
                statusId
            );
            
            console.log(`Status ${statusId} deleted successfully`);
            
        } catch (error) {
            console.error('Error deleting status:', error);
            throw error;
        }
    }

    /**
     * Extract file ID from Appwrite file URL
     * @private
     */
    extractFileIdFromUrl(url) {
        const matches = url.match(/files\/([^/]+)\/view/);
        return matches ? matches[1] : null;
    }

    /**
     * Helper to create an increment operation
     * @private
     */
    static increment(value) {
        return value >= 0 ? `+${value}` : `${value}`;
    }
}

// Example usage
async function example() {
    const statusManager = new StatusManager();
    const userId = 'user123';
    
    try {
        // Example: Create a text status
        // await statusManager.createStatus(userId, 'Hello, world!');
        
        // Example: Create a status with an image
        // const mediaFile = {
        //     path: './path/to/image.jpg',
        //     type: 'image/jpeg'
        // };
        // await statusManager.createStatus(userId, 'Check out this image!', mediaFile);
        
        // Example: Get user feed
        // const feed = await statusManager.getUserFeed(userId, 10);
        // console.log('User feed:', feed);
        
    } catch (error) {
        console.error('Example failed:', error);
    }
}

// Uncomment to run the example
// example().catch(console.error);

module.exports = StatusManager;
