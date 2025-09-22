import { Client, Account, Databases, Storage, Functions, Teams } from 'appwrite';
import { appwriteConfig } from '@/config/appwrite';

// Create Appwrite client
const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

// Initialize services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
const teams = new Teams(client);

// Base service class that other services will extend
class AppwriteService {
  protected client: Client;
  protected account: Account;
  protected databases: Databases;
  protected storage: Storage;
  protected functions: Functions;
  protected teams: Teams;
  protected databaseId: string;

  constructor() {
    this.client = client;
    this.account = account;
    this.databases = databases;
    this.storage = storage;
    this.functions = functions;
    this.teams = teams;
    this.databaseId = appwriteConfig.databaseId;
  }

  // Helper methods for common operations
  protected async createDocument(collectionId: string, documentId: string, data: any, permissions?: string[]) {
    try {
      return await this.databases.createDocument(
        this.databaseId,
        collectionId,
        documentId,
        data,
        permissions
      );
    } catch (error) {
      console.error(`Error creating document in ${collectionId}:`, error);
      throw error;
    }
  }

  protected async getDocument(collectionId: string, documentId: string) {
    try {
      return await this.databases.getDocument(
        this.databaseId,
        collectionId,
        documentId
      );
    } catch (error) {
      console.error(`Error getting document ${documentId} from ${collectionId}:`, error);
      throw error;
    }
  }

  protected async listDocuments(collectionId: string, queries?: string[] | any[]) {
    try {
      return await this.databases.listDocuments(
        this.databaseId,
        collectionId,
        queries
      );
    } catch (error) {
      console.error(`Error listing documents from ${collectionId}:`, error);
      throw error;
    }
  }

  protected async updateDocument(collectionId: string, documentId: string, data: any) {
    try {
      return await this.databases.updateDocument(
        this.databaseId,
        collectionId,
        documentId,
        data
      );
    } catch (error) {
      console.error(`Error updating document ${documentId} in ${collectionId}:`, error);
      throw error;
    }
  }

  protected async deleteDocument(collectionId: string, documentId: string) {
    try {
      return await this.databases.deleteDocument(
        this.databaseId,
        collectionId,
        documentId
      );
    } catch (error) {
      console.error(`Error deleting document ${documentId} from ${collectionId}:`, error);
      throw error;
    }
  }

  // Batch operations
  protected async batchCreateDocuments(collectionId: string, documents: { documentId: string; data: any; permissions?: string[] }[]) {
    try {
      const promises = documents.map(doc => {
        return this.createDocument(collectionId, doc.documentId, doc.data, doc.permissions);
      });
      return await Promise.all(promises);
    } catch (error) {
      console.error(`Error batch creating documents in ${collectionId}:`, error);
      throw error;
    }
  }

  protected async batchUpdateDocuments(collectionId: string, documents: { documentId: string; data: any }[]) {
    try {
      const promises = documents.map(doc => {
        return this.updateDocument(collectionId, doc.documentId, doc.data);
      });
      return await Promise.all(promises);
    } catch (error) {
      console.error(`Error batch updating documents in ${collectionId}:`, error);
      throw error;
    }
  }

  // File storage operations
  protected async uploadFile(bucketId: string, fileId: string, file: File, permissions?: string[]) {
    try {
      return await this.storage.createFile(
        bucketId,
        fileId,
        file,
        permissions
      );
    } catch (error) {
      console.error(`Error uploading file to ${bucketId}:`, error);
      throw error;
    }
  }

  protected getFileView(bucketId: string, fileId: string) {
    return this.storage.getFileView(bucketId, fileId);
  }

  protected async deleteFile(bucketId: string, fileId: string) {
    try {
      return await this.storage.deleteFile(bucketId, fileId);
    } catch (error) {
      console.error(`Error deleting file ${fileId} from ${bucketId}:`, error);
      throw error;
    }
  }

  // Real-time subscriptions
  protected createRealtimeSubscription(channels: string[], callback: (response: any) => void) {
    return client.subscribe(channels, callback);
  }

  // Utility method to generate a unique ID
  protected generateId(prefix: string = '') {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility method to get current user
  protected async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

export { AppwriteService };
