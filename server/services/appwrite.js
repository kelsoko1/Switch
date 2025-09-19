const { Client, Account, Databases, Storage, Functions, Teams, Avatars, Locale, Query, ID } = require('node-appwrite');
require('dotenv').config();

class AppwriteService {
  constructor() {
    this.client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.functions = new Functions(this.client);
    this.teams = new Teams(this.client);
    this.avatars = new Avatars(this.client);
    this.locale = new Locale(this.client);

    // Database IDs - Update these with your actual database and collection IDs
    this.databaseId = process.env.APPWRITE_DATABASE_ID || 'default';
    this.userCollectionId = process.env.APPWRITE_USERS_COLLECTION_ID || 'users';
    this.walletCollectionId = process.env.APPWRITE_WALLETS_COLLECTION_ID || 'wallets';
    this.transactionsCollectionId = process.env.APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions';
  }

  // Account Management
  async createAccount(email, password, name) {
    return await this.account.create(ID.unique(), email, password, name);
  }

  async createSession(email, password) {
    return await this.account.createEmailSession(email, password);
  }

  async getCurrentSession() {
    return await this.account.getSession('current');
  }

  async getCurrentUser() {
    return await this.account.get();
  }

  async updateUserEmail(email, password) {
    return await this.account.updateEmail(email, password);
  }

  async updateUserName(name) {
    return await this.account.updateName(name);
  }

  async updatePassword(password, oldPassword) {
    return await this.account.updatePassword(password, oldPassword);
  }

  async deleteSession(sessionId = 'current') {
    return await this.account.deleteSession(sessionId);
  }

  // Database Operations
  async createDocument(collectionId, data, permissions = null) {
    return await this.databases.createDocument(
      this.databaseId,
      collectionId,
      ID.unique(),
      data,
      permissions
    );
  }

  async listDocuments(collectionId, queries = []) {
    return await this.databases.listDocuments(
      this.databaseId,
      collectionId,
      queries
    );
  }

  async getDocument(collectionId, documentId) {
    return await this.databases.getDocument(
      this.databaseId,
      collectionId,
      documentId
    );
  }

  async updateDocument(collectionId, documentId, data) {
    return await this.databases.updateDocument(
      this.databaseId,
      collectionId,
      documentId,
      data
    );
  }

  async deleteDocument(collectionId, documentId) {
    return await this.databases.deleteDocument(
      this.databaseId,
      collectionId,
      documentId
    );
  }

  // Storage Operations
  async createFile(bucketId, file, permissions = []) {
    return await this.storage.createFile(
      bucketId,
      ID.unique(),
      file,
      permissions
    );
  }

  async getFile(bucketId, fileId) {
    return await this.storage.getFile(bucketId, fileId);
  }

  async getFileDownload(bucketId, fileId) {
    return await this.storage.getFileDownload(bucketId, fileId);
  }

  async deleteFile(bucketId, fileId) {
    return await this.storage.deleteFile(bucketId, fileId);
  }

  // Teams
  async createTeam(name, roles = []) {
    return await this.teams.create(ID.unique(), name, roles);
  }

  async addTeamMember(teamId, email, roles = []) {
    return await this.teams.createMembership(teamId, roles, email);
  }

  // Functions
  async createFunction(name, execute = [], runtime = 'node-18.0') {
    return await this.functions.create(
      ID.unique(),
      name,
      execute,
      runtime
    );
  }

  async executeFunction(functionId, data = {}) {
    return await this.functions.createExecution(functionId, JSON.stringify(data));
  }

  // Avatars
  getInitials(name = '', width = 500, height = 500) {
    return this.avatars.getInitials(name, width, height);
  }

  getQR(text, size = 400) {
    return this.avatars.getQR(text, size);
  }

  // Locale
  async getLocale() {
    return await this.locale.get();
  }

  async getCountries() {
    return await this.locale.getCountries();
  }

  async getCurrencies() {
    return await this.locale.getCurrencies();
  }

  // Realtime
  subscribe(channels, callback) {
    return this.client.subscribe(channels, callback);
  }
}

module.exports = new AppwriteService();
