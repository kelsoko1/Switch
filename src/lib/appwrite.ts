import { Client, Account, Databases, Storage, Teams, Avatars, ID, Models, AppwriteException } from 'appwrite';

import { env } from '../config/env';

// Appwrite Configuration
const config = {
    endpoint: env.APPWRITE_ENDPOINT,
    projectId: env.APPWRITE_PROJECT_ID,
    databaseId: env.APPWRITE_DATABASE_ID
} as const;

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

// Initialize Appwrite Services
const services = {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    teams: new Teams(client),
    avatars: new Avatars(client)
} as const;

// Collection IDs
const COLLECTIONS = {
    USERS: 'users',
    GROUPS: 'groups',
    MEMBERS: 'members',
    TRANSACTIONS: 'transactions',
    PAYMENTS: 'payments',
    OVERDRAFTS: 'overdrafts',
    WALLETS: 'wallets',
    WALLET_TRANSACTIONS: 'wallet_transactions',
    WALLET_PAYMENTS: 'wallet_payments',
    MESSAGES: 'messages',
    SAVINGS_GOALS: 'savings_goals',
    GROUP_MEMBERS: 'group_members'
} as const;

// Storage bucket IDs
const BUCKETS = {
    AVATARS: 'avatars',
    DOCUMENTS: 'documents'
} as const;

// Authentication Service
const auth = {
    // Get current user
    async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
        try {
            return await services.account.get();
        } catch (error) {
            if (error instanceof AppwriteException) {
                console.error('Appwrite error:', error.message);
                if (error.code === 401) {
                    console.log('User is not authenticated');
                    return null;
                }
            }
            console.error('Error getting current user:', error);
            return null;
        }
    },

    // Create account
    async createAccount(email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> {
        try {
            return await services.account.create(ID.unique(), email, password, name);
        } catch (error) {
            if (error instanceof AppwriteException) {
                console.error('Appwrite error:', error.message);
                switch (error.code) {
                    case 400:
                        throw new Error('Invalid email or password format');
                    case 409:
                        throw new Error('Email already exists');
                    default:
                        throw new Error('Account creation failed');
                }
            }
            throw error;
        }
    },

    // Create session
    async createSession(email: string, password: string): Promise<{ session: Models.Session; user: Models.User<Models.Preferences> }> {
        try {
            const session = await services.account.createSession(email, password);
            const user = await services.account.get();
            return { session, user };
        } catch (error) {
            if (error instanceof AppwriteException) {
                console.error('Appwrite error:', error.message);
                switch (error.code) {
                    case 401:
                        throw new Error('Invalid credentials');
                    case 429:
                        throw new Error('Too many attempts, please try again later');
                    default:
                        throw new Error('Authentication failed');
                }
            }
            throw error;
        }
    },

    // Delete current session
    async logout(): Promise<void> {
        try {
            await services.account.deleteSession('current');
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    },

    // Delete all sessions
    async logoutAll(): Promise<void> {
        try {
            await services.account.deleteSessions();
        } catch (error) {
            console.error('Error deleting all sessions:', error);
            throw error;
        }
    }
};

// Database Service
const database = {
    // Create document
    async createDocument<T extends object>(
        collectionId: string,
        data: T,
        permissions?: string[]
    ): Promise<Models.Document> {
        try {
            return await services.databases.createDocument(
                config.databaseId,
                collectionId,
                ID.unique(),
                data,
                permissions
            );
        } catch (error) {
            console.error('Error creating document:', error);
            throw error;
        }
    },

    // Get document
    async getDocument(
        collectionId: string,
        documentId: string
    ): Promise<Models.Document> {
        try {
            return await services.databases.getDocument(
                config.databaseId,
                collectionId,
                documentId
            );
        } catch (error) {
            console.error('Error getting document:', error);
            throw error;
        }
    },

    // List documents
    async listDocuments(
        collectionId: string,
        queries?: string[]
    ): Promise<Models.DocumentList<Models.Document>> {
        try {
            return await services.databases.listDocuments(
                config.databaseId,
                collectionId,
                queries
            );
        } catch (error) {
            console.error('Error listing documents:', error);
            throw error;
        }
    },

    // Update document
    async updateDocument<T extends object>(
        collectionId: string,
        documentId: string,
        data: T
    ): Promise<Models.Document> {
        try {
            return await services.databases.updateDocument(
                config.databaseId,
                collectionId,
                documentId,
                data
            );
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    },

    // Delete document
    async deleteDocument(
        collectionId: string,
        documentId: string
    ): Promise<void> {
        try {
            await services.databases.deleteDocument(
                config.databaseId,
                collectionId,
                documentId
            );
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }
};

// Storage Service
const storage = {
    // Upload file
    async uploadFile(
        bucketId: string,
        file: File,
        permissions?: string[]
    ): Promise<Models.File> {
        try {
            return await services.storage.createFile(
                bucketId,
                ID.unique(),
                file,
                permissions
            );
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // Delete file
    async deleteFile(bucketId: string, fileId: string): Promise<void> {
        try {
            await services.storage.deleteFile(bucketId, fileId);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    },

    // Get file view URL
    getFileView(bucketId: string, fileId: string): string {
        const url = services.storage.getFileView(bucketId, fileId);
        return url.toString();
    }
};

export {
    client,
    services,
    auth,
    database,
    storage,
    COLLECTIONS,
    BUCKETS
};

export default client;
