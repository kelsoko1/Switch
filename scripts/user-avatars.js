const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const AppwriteUtils = require('../appwrite-utils');

class UserAvatarManager extends AppwriteUtils {
    constructor() {
        super();
        this.avatarBucketId = 'profile_images';
    }

    /**
     * Upload a new avatar for a user
     * @param {string} userId - The ID of the user
     * @param {string} filePath - Path to the avatar image
     * @returns {Promise<string>} URL of the uploaded avatar
     */
    async uploadUserAvatar(userId, filePath) {
        try {
            // Generate a unique filename
            const ext = path.extname(filePath);
            const fileName = `avatar_${userId}_${uuidv4()}${ext}`;
            
            // Upload the file
            const file = await this.uploadFile(this.avatarBucketId, filePath, fileName);
            const avatarUrl = this.getFileUrl(this.avatarBucketId, file.$id);
            
            // Update user document with new avatar URL
            await this.updateUserPrefs(userId, { avatar: avatarUrl });
            
            console.log(`Avatar uploaded for user ${userId}: ${avatarUrl}`);
            return avatarUrl;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    }

    /**
     * Update user preferences
     * @param {string} userId - The ID of the user
     * @param {Object} updates - Preferences to update
     */
    async updateUserPrefs(userId, updates) {
        try {
            // First get the current prefs
            const user = await this.account.get(userId);
            const currentPrefs = user.prefs || {};
            
            // Merge with updates
            const newPrefs = { ...currentPrefs, ...updates };
            
            // Update the user
            await this.account.updatePrefs(newPrefs);
            console.log(`Updated preferences for user ${userId}`);
        } catch (error) {
            console.error('Error updating user preferences:', error);
            throw error;
        }
    }

    /**
     * Delete a user's avatar
     * @param {string} userId - The ID of the user
     * @param {string} avatarUrl - The URL of the avatar to delete
     */
    async deleteUserAvatar(userId, avatarUrl) {
        try {
            // Extract file ID from URL
            const fileId = this.extractFileIdFromUrl(avatarUrl);
            if (!fileId) throw new Error('Invalid avatar URL');
            
            // Delete the file
            await this.deleteFile(this.avatarBucketId, fileId);
            
            // Clear avatar from user prefs
            await this.updateUserPrefs(userId, { avatar: null });
            
            console.log(`Deleted avatar for user ${userId}`);
        } catch (error) {
            console.error('Error deleting avatar:', error);
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
}

// Example usage
async function example() {
    const avatarManager = new UserAvatarManager();
    
    try {
        // Example: Upload a new avatar
        // const avatarUrl = await avatarManager.uploadUserAvatar('user123', './path/to/avatar.jpg');
        // console.log('New avatar URL:', avatarUrl);
        
        // Example: Delete an avatar
        // await avatarManager.deleteUserAvatar('user123', 'https://...');
        
    } catch (error) {
        console.error('Example failed:', error);
    }
}

// Uncomment to run the example
// example().catch(console.error);

module.exports = UserAvatarManager;
