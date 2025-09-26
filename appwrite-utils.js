const { Client, Databases, Storage, Account, Teams, Query } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

class AppwriteUtils {
    constructor() {
        this.client = new Client()
            .setEndpoint('https://fra.cloud.appwrite.io/v1')
            .setProject('68ac2652001ca468e987')
            .setKey('standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498');

        this.databases = new Databases(this.client);
        this.storage = new Storage(this.client);
        this.account = new Account(this.client);
        this.teams = new Teams(this.client);
        this.databaseId = '68ac3f000002c33d8048';
    }

    // ==================== Storage Utils ====================

    /**
     * Upload a file to a storage bucket
     * @param {string} bucketId - The ID of the bucket
     * @param {string} filePath - Path to the file to upload
     * @param {string} [fileName] - Optional custom file name
     * @returns {Promise<Object>} Uploaded file details
     */
    async uploadFile(bucketId, filePath, fileName = null) {
        const fileStream = fs.createReadStream(filePath);
        const fileStats = fs.statSync(filePath);
        const file = {
            name: fileName || path.basename(filePath),
            size: fileStats.size,
            stream: fileStream
        };

        return await this.storage.createFile(bucketId, 'unique()', file);
    }

    /**
     * List all files in a bucket
     * @param {string} bucketId - The ID of the bucket
     * @returns {Promise<Array>} List of files
     */
    async listFiles(bucketId) {
        const response = await this.storage.listFiles(bucketId);
        return response.files;
    }

    /**
     * Delete a file from storage
     * @param {string} bucketId - The ID of the bucket
     * @param {string} fileId - The ID of the file to delete
     */
    async deleteFile(bucketId, fileId) {
        return await this.storage.deleteFile(bucketId, fileId);
    }

    // ==================== Database Utils ====================

    /**
     * Create a document in a collection
     * @param {string} collectionId - The ID of the collection
     * @param {Object} data - Document data
     * @param {Array<string>} [permissions] - Optional permissions array
     * @returns {Promise<Object>} Created document
     */
    async createDocument(collectionId, data, permissions = []) {
        return await this.databases.createDocument(
            this.databaseId,
            collectionId,
            'unique()',
            data,
            permissions
        );
    }

    /**
     * List documents in a collection
     * @param {string} collectionId - The ID of the collection
     * @param {Array<string>} [queries] - Optional query filters
     * @returns {Promise<Array>} List of documents
     */
    async listDocuments(collectionId, queries = []) {
        const response = await this.databases.listDocuments(
            this.databaseId,
            collectionId,
            queries
        );
        return response.documents;
    }

    /**
     * Update a document
     * @param {string} collectionId - The ID of the collection
     * @param {string} documentId - The ID of the document to update
     * @param {Object} data - Updated data
     * @returns {Promise<Object>} Updated document
     */
    async updateDocument(collectionId, documentId, data) {
        return await this.databases.updateDocument(
            this.databaseId,
            collectionId,
            documentId,
            data
        );
    }

    // ==================== User Management ====================

    /**
     * Create a new user
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @param {string} name - User's name
     * @returns {Promise<Object>} Created user
     */
    async createUser(email, password, name) {
        return await this.account.create('unique()', email, password, name);
    }

    /**
     * Get user by ID
     * @param {string} userId - The ID of the user
     * @returns {Promise<Object>} User details
     */
    async getUser(userId) {
        return await this.account.get(userId);
    }

    // ==================== Team Management ====================

    /**
     * Create a new team
     * @param {string} name - Team name
     * @param {Array<string>} [roles] - Optional team roles
     * @returns {Promise<Object>} Created team
     */
    async createTeam(name, roles = []) {
        return await this.teams.create('unique()', name, roles);
    }

    /**
     * Add member to team
     * @param {string} teamId - The ID of the team
     * @param {string} email - User's email
     * @param {Array<string>} [roles] - Optional roles for the member
     * @returns {Promise<Object>} Membership details
     */
    async addTeamMember(teamId, email, roles = []) {
        return await this.teams.createMembership(
            teamId,
            roles,
            undefined, // url
            email
        );
    }

    // ==================== Query Helpers ====================

    /**
     * Create a query for filtering documents
     * @param {string} attribute - Attribute to filter on
     * @param {string} operator - Query operator (==, !=, >, <, >=, <=, contains, search)
     * @param {any} value - Value to compare against
     * @returns {string} Query string
     */
    static query(attribute, operator, value) {
        return Query[operator](attribute, value);
    }

    // ==================== File Operations ====================

    /**
     * Upload multiple files to a bucket
     * @param {string} bucketId - The ID of the bucket
     * @param {Array<string>} filePaths - Array of file paths to upload
     * @returns {Promise<Array>} Array of uploaded file details
     */
    async uploadFiles(bucketId, filePaths) {
        const uploadPromises = filePaths.map(filePath => 
            this.uploadFile(bucketId, filePath)
                .catch(error => ({
                    file: filePath,
                    success: false,
                    error: error.message
                }))
        );
        
        return Promise.all(uploadPromises);
    }

    /**
     * Get file download URL
     * @param {string} bucketId - The ID of the bucket
     * @param {string} fileId - The ID of the file
     * @returns {string} File download URL
     */
    getFileUrl(bucketId, fileId) {
        return this.storage.getFileView(bucketId, fileId);
    }

    // ==================== Collection Management ====================

    /**
     * Get collection schema
     * @param {string} collectionId - The ID of the collection
     * @returns {Promise<Object>} Collection schema
     */
    async getCollectionSchema(collectionId) {
        return await this.databases.getCollection(this.databaseId, collectionId);
    }

    /**
     * Create index on a collection
     * @param {string} collectionId - The ID of the collection
     * @param {string} key - Attribute to index
     * @param {string} type - Index type (key, fulltext, unique, array)
     * @param {Array<string>} attributes - Attributes to include in the index
     * @returns {Promise<Object>} Created index
     */
    async createIndex(collectionId, key, type = 'key', attributes = [key]) {
        return await this.databases.createIndex(
            this.databaseId,
            collectionId,
            'unique()',
            key,
            type,
            attributes
        );
    }

    // ==================== User Sessions ====================

    /**
     * Get active user sessions
     * @returns {Promise<Array>} List of active sessions
     */
    async getSessions() {
        const { sessions } = await this.account.listSessions();
        return sessions;
    }

    /**
     * Delete all sessions except current one
     */
    async deleteOtherSessions() {
        const sessions = await this.getSessions();
        const currentSession = this.client.config.session;
        
        for (const session of sessions) {
            if (session.$id !== currentSession) {
                await this.account.deleteSession(session.$id);
            }
        }
    }

    // ==================== Backup Utils ====================

    /**
     * Backup collection data to a JSON file
     * @param {string} collectionId - The ID of the collection
     * @param {string} outputPath - Path to save the backup file
     * @param {Array<string>} [queries] - Optional query filters
     */
    async backupCollection(collectionId, outputPath, queries = []) {
        const documents = await this.listDocuments(collectionId, queries);
        const backupData = {
            collectionId,
            timestamp: new Date().toISOString(),
            documentCount: documents.length,
            documents
        };
        
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2));
        console.log(`Backup saved to ${outputPath} (${documents.length} documents)`);
    }

    /**
     * Restore collection data from a JSON file
     * @param {string} inputPath - Path to the backup file
     * @param {string} [targetCollectionId] - Optional target collection ID (if different from backup)
     */
    async restoreCollection(inputPath, targetCollectionId = null) {
        const backupData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
        const collectionId = targetCollectionId || backupData.collectionId;
        let successCount = 0;
        
        for (const doc of backupData.documents) {
            try {
                // Remove system fields
                const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, ...docData } = doc;
                await this.createDocument(collectionId, docData);
                successCount++;
            } catch (error) {
                console.error(`Error restoring document ${doc.$id}: ${error.message}`);
            }
        }
        
        console.log(`Restored ${successCount}/${backupData.documents.length} documents to ${collectionId}`);
    }

    // ==================== Batch Operations ====================

    /**
     * Batch delete documents matching a query
     * @param {string} collectionId - The ID of the collection
     * @param {Array<string>} queries - Query filters
     * @param {number} [batchSize=25] - Number of documents to delete per batch
     */
    async batchDelete(collectionId, queries = [], batchSize = 25) {
        let offset = 0;
        let totalDeleted = 0;
        let hasMore = true;
        
        while (hasMore) {
            const batchQueries = [
                ...queries,
                Query.limit(batchSize),
                Query.offset(offset)
            ];
            
            const { documents } = await this.databases.listDocuments(
                this.databaseId,
                collectionId,
                batchQueries
            );
            
            if (documents.length === 0) {
                hasMore = false;
                continue;
            }
            
            // Delete documents in parallel
            await Promise.all(
                documents.map(doc => 
                    this.databases.deleteDocument(this.databaseId, collectionId, doc.$id)
                        .catch(error => ({
                            id: doc.$id,
                            success: false,
                            error: error.message
                        }))
                )
            );
            
            totalDeleted += documents.length;
            offset += batchSize;
            console.log(`Deleted ${totalDeleted} documents so far...`);
        }
        
        console.log(`Batch delete completed. Total deleted: ${totalDeleted}`);
        return totalDeleted;
    }
}

// ==================== Example Scripts ====================

/**
 * Example 1: Backup and Restore
 * This example shows how to backup a collection and restore it
 */
async function exampleBackupRestore() {
    const utils = new AppwriteUtils();
    const collectionId = 'your_collection_id';
    const backupPath = './backups/collection-backup.json';
    
    try {
        // Backup collection
        console.log('Starting backup...');
        await utils.backupCollection(collectionId, backupPath);
        
        // Restore to same or different collection
        // await utils.restoreCollection(backupPath, collectionId);
        
        console.log('Backup/restore completed successfully');
    } catch (error) {
        console.error('Backup/restore failed:', error);
    }
}

/**
 * Example 2: Batch Upload Files
 * This example shows how to upload multiple files to a bucket
 */
async function exampleBatchUpload() {
    const utils = new AppwriteUtils();
    const bucketId = 'status_media';
    const filesToUpload = [
        './assets/image1.jpg',
        './assets/image2.jpg',
        // Add more files as needed
    ];
    
    try {
        console.log('Starting batch upload...');
        const results = await utils.uploadFiles(bucketId, filesToUpload);
        
        const successCount = results.filter(r => r.success).length;
        console.log(`Upload complete. Success: ${successCount}, Failed: ${results.length - successCount}`);
        
        // Log failed uploads
        results.filter(r => !r.success).forEach(result => {
            console.error(`Failed to upload ${result.file}:`, result.error);
        });
    } catch (error) {
        console.error('Batch upload failed:', error);
    }
}

/**
 * Example 3: Query Builder
 * This example shows how to use the query builder
 */
async function exampleQueryBuilder() {
    const utils = new AppwriteUtils();
    const collectionId = 'statuses';
    
    try {
        // Create complex queries
        const queries = [
            AppwriteUtils.query('userId', 'equal', 'current_user_id'),
            AppwriteUtils.query('createdAt', 'greaterThan', '2023-01-01'),
            AppwriteUtils.query('isPublic', 'equal', true)
        ];
        
        console.log('Fetching documents with queries:', queries);
        const results = await utils.listDocuments(collectionId, queries);
        console.log(`Found ${results.length} matching documents`);
        
    } catch (error) {
        console.error('Query failed:', error);
    }
}

// Run the examples
async function runExamples() {
    console.log('=== Appwrite Utils Examples ===');
    
    // Uncomment the example you want to run
    // await exampleBackupRestore();
    // await exampleBatchUpload();
    // await exampleQueryBuilder();
}

// Uncomment to run the examples
// runExamples().catch(console.error);

module.exports = AppwriteUtils;
