/**
 * Initialize Appwrite Collections for Live Streaming
 * 
 * This script creates the required collections for the live streaming feature:
 * - live_streams: Store stream metadata
 * - stream_comments: Store stream comments
 * 
 * IMPORTANT: This script requires Appwrite CLI or manual setup
 * For now, use the Appwrite Console to create collections
 * 
 * Run with: node scripts/init-live-streaming-db.js
 */

import { Client, Databases, ID, Permission, Role } from 'appwrite';
import { config } from 'dotenv';

config();

const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '');

const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || '';

async function createLiveStreamsCollection() {
  console.log('\n📹 Creating live_streams collection...');
  
  try {
    // Note: createCollection requires Appwrite SDK for Server
    // For web SDK, collections must be created via Appwrite Console
    console.log('⚠️  Web SDK cannot create collections directly');
    console.log('📝 Please create collection manually in Appwrite Console:');
    console.log('   Collection ID: live_streams');
    console.log('   Name: Live Streams');
    console.log('');
    console.log('   Attributes:');
    console.log('   - streamId (string, 255, required, unique)');
    console.log('   - title (string, 255, required)');
    console.log('   - streamerId (string, 255, required)');
    console.log('   - streamerName (string, 255, required)');
    console.log('   - streamerAvatar (string, 2000, optional)');
    console.log('   - isLive (boolean, required, default: true)');
    console.log('   - viewerCount (integer, required, default: 0)');
    console.log('   - likeCount (integer, required, default: 0)');
    console.log('   - startedAt (string, 50, required)');
    console.log('   - endedAt (string, 50, optional)');
    console.log('');
    console.log('   Indexes:');
    console.log('   - streamId_idx (unique, streamId)');
    console.log('   - streamerId_idx (key, streamerId)');
    console.log('   - isLive_idx (key, isLive)');
    console.log('   - createdAt_idx (key, $createdAt, DESC)');
    console.log('');
    console.log('   Permissions:');
    console.log('   - Read: Any');
    console.log('   - Create: Users');
    console.log('   - Update: Users');
    console.log('   - Delete: Users');
    
    return;
    
    /* Original code - requires Server SDK
    const collection = await databases.createCollection(
      DATABASE_ID,
      'live_streams',
      'Live Streams',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection created:', collection.$id);

    // Create attributes
    await databases.createStringAttribute(DATABASE_ID, 'live_streams', 'streamId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'live_streams', 'title', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'live_streams', 'streamerId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'live_streams', 'streamerName', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'live_streams', 'streamerAvatar', 2000, false);
    await databases.createBooleanAttribute(DATABASE_ID, 'live_streams', 'isLive', true, true);
    await databases.createIntegerAttribute(DATABASE_ID, 'live_streams', 'viewerCount', true, 0);
    await databases.createIntegerAttribute(DATABASE_ID, 'live_streams', 'likeCount', true, 0);
    await databases.createStringAttribute(DATABASE_ID, 'live_streams', 'startedAt', 50, true);
    await databases.createStringAttribute(DATABASE_ID, 'live_streams', 'endedAt', 50, false);

    console.log('✅ Attributes created');

    // Wait for attributes to be available
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create indexes
    await databases.createIndex(DATABASE_ID, 'live_streams', 'streamId_idx', 'unique', ['streamId']);
    await databases.createIndex(DATABASE_ID, 'live_streams', 'streamerId_idx', 'key', ['streamerId']);
    await databases.createIndex(DATABASE_ID, 'live_streams', 'isLive_idx', 'key', ['isLive']);
    await databases.createIndex(DATABASE_ID, 'live_streams', 'createdAt_idx', 'key', ['$createdAt'], ['DESC']);

    console.log('✅ Indexes created');
    console.log('✅ live_streams collection setup complete!');
    */

  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ️  Collection already exists');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }
}

async function createStreamCommentsCollection() {
  console.log('\n💬 Creating stream_comments collection...');
  
  try {
    console.log('📝 Please create collection manually in Appwrite Console:');
    console.log('   Collection ID: stream_comments');
    console.log('   Name: Stream Comments');
    console.log('');
    console.log('   Attributes:');
    console.log('   - streamId (string, 255, required)');
    console.log('   - userId (string, 255, required)');
    console.log('   - userName (string, 255, required)');
    console.log('   - userAvatar (string, 2000, optional)');
    console.log('   - message (string, 500, required)');
    console.log('   - timestamp (string, 50, required)');
    console.log('');
    console.log('   Indexes:');
    console.log('   - streamId_idx (key, streamId)');
    console.log('   - userId_idx (key, userId)');
    console.log('   - timestamp_idx (key, timestamp, ASC)');
    console.log('');
    console.log('   Permissions:');
    console.log('   - Read: Any');
    console.log('   - Create: Users');
    console.log('   - Update: Users');
    console.log('   - Delete: Users');
    
    return;
    
    /* Original code - requires Server SDK
    const collection = await databases.createCollection(
      DATABASE_ID,
      'stream_comments',
      'Stream Comments',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection created:', collection.$id);

    // Create attributes
    await databases.createStringAttribute(DATABASE_ID, 'stream_comments', 'streamId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'stream_comments', 'userId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'stream_comments', 'userName', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'stream_comments', 'userAvatar', 2000, false);
    await databases.createStringAttribute(DATABASE_ID, 'stream_comments', 'message', 500, true);
    await databases.createStringAttribute(DATABASE_ID, 'stream_comments', 'timestamp', 50, true);

    console.log('✅ Attributes created');

    // Wait for attributes to be available
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create indexes
    await databases.createIndex(DATABASE_ID, 'stream_comments', 'streamId_idx', 'key', ['streamId']);
    await databases.createIndex(DATABASE_ID, 'stream_comments', 'userId_idx', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, 'stream_comments', 'timestamp_idx', 'key', ['timestamp'], ['ASC']);

    console.log('✅ Indexes created');
    console.log('✅ stream_comments collection setup complete!');
    */

  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ️  Collection already exists');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }
}

async function main() {
  console.log('🚀 Live Streaming Database Setup Guide');
  console.log('📊 Database ID:', DATABASE_ID);
  console.log('');
  console.log('⚠️  IMPORTANT: The Web SDK cannot create collections automatically.');
  console.log('📝 Please follow these steps in the Appwrite Console:');
  console.log('');
  console.log('🌐 Open: https://cloud.appwrite.io/console');
  console.log('📂 Navigate to: Your Project > Databases > Your Database');
  console.log('');

  try {
    await createLiveStreamsCollection();
    await createStreamCommentsCollection();

    console.log('\n✅ Setup guide displayed!');
    console.log('\n📝 Next Steps:');
    console.log('  1. Open Appwrite Console');
    console.log('  2. Create the collections as shown above');
    console.log('  3. Test your live streaming feature');
    console.log('\n🎉 Once created, your live streaming will work!');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
