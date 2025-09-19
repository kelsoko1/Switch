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
    return await this.databases.createDocument(
      this.databaseId,
      collectionId,
      documentId,
      data,
      permissions
    );
  }

  protected async getDocument(collectionId: string, documentId: string) {
    return await this.databases.getDocument(
      this.databaseId,
      collectionId,
      documentId
    );
  }

  protected async listDocuments(collectionId: string, queries?: string[]) {
    return await this.databases.listDocuments(
      this.databaseId,
      collectionId,
      queries
    );
  }

  protected async updateDocument(collectionId: string, documentId: string, data: any) {
    return await this.databases.updateDocument(
      this.databaseId,
      collectionId,
      documentId,
      data
    );
  }

  protected async deleteDocument(collectionId: string, documentId: string) {
    return await this.databases.deleteDocument(
      this.databaseId,
      collectionId,
      documentId
    );
  }

  // Utility method to generate a unique ID
  protected generateId(prefix: string = '') {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { AppwriteService };
