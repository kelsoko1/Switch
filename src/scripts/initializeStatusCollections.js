// Script to initialize Appwrite collections and buckets for status feature
import { Client, Databases, Storage } from 'node-appwrite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.VITE_APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;

// Collection names
const STATUS_UPDATES = 'status_updates';
const STATUS_VIEWS = 'status_views';

// Bucket names
const STATUS_MEDIA = 'status_media';

async function createStatusCollections() {
  try {
    console.log('Creating status collections and buckets...');

    // Create status_updates collection if it doesn't exist
    try {
      await databases.getCollection(databaseId, STATUS_UPDATES);
      console.log('Status updates collection already exists');
    } catch (error) {
      console.log('Creating status updates collection...');
      await databases.createCollection(
        databaseId,
        STATUS_UPDATES,
        'Status Updates',
        ['user:*'],
        ['user:*']
      );

      // Create attributes for status_updates collection
      await databases.createStringAttribute(databaseId, STATUS_UPDATES, 'user_id', 36, true);
      await databases.createEnumAttribute(databaseId, STATUS_UPDATES, 'type', ['photo', 'video', 'text'], true);
      await databases.createStringAttribute(databaseId, STATUS_UPDATES, 'content', 2048, true);
      await databases.createStringAttribute(databaseId, STATUS_UPDATES, 'caption', 500, false);
      await databases.createStringAttribute(databaseId, STATUS_UPDATES, 'background', 100, false); // For text statuses
      await databases.createDatetimeAttribute(databaseId, STATUS_UPDATES, 'created_at', true);
      await databases.createDatetimeAttribute(databaseId, STATUS_UPDATES, 'expires_at', true);

      console.log('Status updates collection created successfully');
    }

    // Create status_views collection if it doesn't exist
    try {
      await databases.getCollection(databaseId, STATUS_VIEWS);
      console.log('Status views collection already exists');
    } catch (error) {
      console.log('Creating status views collection...');
      await databases.createCollection(
        databaseId,
        STATUS_VIEWS,
        'Status Views',
        ['user:*'],
        ['user:*']
      );

      // Create attributes for status_views collection
      await databases.createStringAttribute(databaseId, STATUS_VIEWS, 'status_id', 36, true);
      await databases.createStringAttribute(databaseId, STATUS_VIEWS, 'viewer_id', 36, true);
      await databases.createDatetimeAttribute(databaseId, STATUS_VIEWS, 'viewed_at', true);

      console.log('Status views collection created successfully');
    }

    // Create status_media bucket if it doesn't exist
    try {
      await storage.getBucket(STATUS_MEDIA);
      console.log('Status media bucket already exists');
    } catch (error) {
      console.log('Creating status media bucket...');
      await storage.createBucket(
        STATUS_MEDIA,
        'Status Media',
        ['file.create'], // Permissions
        true, // File security
        10 * 1024 * 1024, // Maximum file size (10MB)
        ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'] // Allowed file types
      );
      console.log('Status media bucket created successfully');
    }

    console.log('Status collections and buckets setup completed successfully');
  } catch (error) {
    console.error('Error setting up status collections and buckets:', error);
  }
}

// Run the initialization as an IIFE (Immediately Invoked Function Expression)
(async () => {
  try {
    await createStatusCollections();
    console.log('Initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
})();
