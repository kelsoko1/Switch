# Appwrite Collections Setup Guide

## Quick Start

### Verify Collections
```bash
npm run appwrite:verify
```

This command will:
1. ✅ Check which collections exist
2. ❌ List missing collections
3. 🔧 Offer to create missing collections automatically

---

## Required Collections

### 1. **live_streams**
Stores active and past live streaming sessions.

**Attributes:**
- `streamId` (string) - Unique stream identifier
- `title` (string) - Stream title
- `streamerId` (string) - User ID of streamer
- `streamerName` (string) - Display name of streamer
- `category` (string) - Stream category (Gaming, Music, etc.)
- `tags` (array) - Stream tags
- `thumbnailUrl` (string) - Stream thumbnail
- `isLive` (boolean) - Current live status
- `isPaid` (boolean) - Whether stream requires payment
- `price` (double) - Stream price if paid
- `viewerCount` (integer) - Current viewer count
- `likeCount` (integer) - Total likes
- `startedAt` (datetime) - Stream start time
- `endedAt` (datetime) - Stream end time

**Indexes:**
- `streamerId_idx` - Query streams by streamer
- `isLive_idx` - Query active streams

---

### 2. **stream_comments**
Stores comments made during live streams.

**Attributes:**
- `streamId` (string) - Associated stream ID
- `userId` (string) - Commenter user ID
- `userName` (string) - Commenter display name
- `message` (string) - Comment content
- `timestamp` (datetime) - Comment time

**Indexes:**
- `streamId_idx` - Query comments by stream

---

### 3. **status_updates**
Stores WhatsApp-style status updates (24-hour stories).

**Attributes:**
- `userId` (string) - Status creator ID
- `userName` (string) - Creator display name
- `userAvatar` (string) - Creator avatar URL
- `type` (string) - Status type (text/image/video)
- `content` (string) - Text content
- `mediaUrl` (string) - Media URL
- `backgroundColor` (string) - Background color for text status
- `font` (string) - Font style for text status
- `expiresAt` (datetime) - Expiration time (24 hours)
- `views` (integer) - View count

**Indexes:**
- `userId_idx` - Query statuses by user
- `expiresAt_idx` - Query active statuses

---

### 4. **videos**
Stores uploaded video content.

**Attributes:**
- `userId` (string) - Uploader ID
- `userName` (string) - Uploader name
- `userAvatar` (string) - Uploader avatar
- `title` (string) - Video title
- `description` (string) - Video description
- `videoUrl` (string) - Video file URL
- `thumbnailUrl` (string) - Thumbnail URL
- `duration` (integer) - Video duration in seconds
- `category` (string) - Video category
- `tags` (array) - Video tags
- `visibility` (string) - Public/Private
- `views` (integer) - View count
- `likes` (integer) - Like count

**Indexes:**
- `userId_idx` - Query videos by user
- `category_idx` - Query videos by category

---

### 5. **shorts**
Stores short-form video content (60 seconds max).

**Attributes:**
- `userId` (string) - Creator ID
- `userName` (string) - Creator name
- `userAvatar` (string) - Creator avatar
- `caption` (string) - Short caption
- `videoUrl` (string) - Video file URL
- `thumbnailUrl` (string) - Thumbnail URL
- `duration` (integer) - Duration in seconds
- `views` (integer) - View count
- `likes` (integer) - Like count

**Indexes:**
- `userId_idx` - Query shorts by user

---

### 6. **groups**
Stores chat groups and savings groups (Kijumbe).

**Attributes:**
- `name` (string) - Group name
- `description` (string) - Group description
- `type` (string) - Group type (chat/kijumbe)
- `created_by` (string) - Creator user ID
- `avatar_url` (string) - Group avatar
- `members` (array) - Member user IDs
- `kiongoziId` (string) - Kijumbe group leader ID
- `contributionAmount` (double) - Monthly contribution
- `cycleDuration` (integer) - Cycle duration in days
- `maxMembers` (integer) - Maximum members
- `currentMembers` (integer) - Current member count
- `status` (string) - Group status (active/completed/paused)

**Indexes:**
- `created_by_idx` - Query groups by creator
- `type_idx` - Query groups by type

---

### 7. **messages**
Stores chat messages.

**Attributes:**
- `groupId` (string) - Associated group ID
- `userId` (string) - Sender user ID
- `userName` (string) - Sender display name
- `content` (string) - Message content
- `type` (string) - Message type (text/image/file)
- `timestamp` (datetime) - Message time
- `read` (boolean) - Read status

**Indexes:**
- `groupId_idx` - Query messages by group
- `timestamp_idx` - Sort messages by time

---

### 8. **wallets**
Stores user wallet information.

**Attributes:**
- `userId` (string) - Owner user ID
- `balance` (double) - Current balance
- `currency` (string) - Currency code (TZS)
- `pin_set` (boolean) - Whether PIN is set
- `daily_limit` (double) - Daily transaction limit
- `monthly_limit` (double) - Monthly transaction limit
- `kijumbe_balance` (double) - Kijumbe savings balance

**Indexes:**
- `userId_idx` (unique) - One wallet per user

---

### 9. **transactions**
Stores transaction history.

**Attributes:**
- `userId` (string) - Transaction owner
- `type` (string) - Transaction type (deposit/withdrawal/transfer)
- `amount` (double) - Transaction amount
- `currency` (string) - Currency code
- `status` (string) - Transaction status (pending/completed/failed)
- `description` (string) - Transaction description
- `recipient` (string) - Recipient user ID
- `sender` (string) - Sender user ID
- `reference` (string) - Transaction reference
- `created_at` (datetime) - Transaction time

**Indexes:**
- `userId_idx` - Query transactions by user
- `type_idx` - Query transactions by type
- `created_at_idx` - Sort transactions by date

---

## Manual Setup

If you prefer to create collections manually:

1. Go to your Appwrite Console
2. Navigate to your database
3. Create each collection using the specifications above
4. Set permissions:
   - Read: Any
   - Create: Users
   - Update: Users
   - Delete: Users

---

## Troubleshooting

### Error: "VITE_APPWRITE_API_KEY not found"
**Solution:** Add your Appwrite API key to `.env`:
```env
VITE_APPWRITE_API_KEY=your_api_key_here
```

### Error: "Collection already exists"
**Solution:** The collection already exists. The script will skip it.

### Error: "Permission denied"
**Solution:** Make sure your API key has proper permissions to create collections.

### Collections not showing in app
**Solution:** 
1. Verify collections exist: `npm run appwrite:verify`
2. Check collection IDs match in code
3. Verify permissions are set correctly

---

## Storage Buckets

In addition to collections, you need these storage buckets:

### **videos** bucket
- Stores video files and thumbnails
- Max file size: 500MB
- Allowed file types: video/*, image/*

To create manually:
1. Go to Appwrite Console → Storage
2. Create bucket with ID: `videos`
3. Set permissions (Read: Any, Create: Users)
4. Configure file size and type limits

---

## Environment Variables

Required in `.env`:
```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_API_KEY=your_api_key
```

---

## Next Steps

After setting up collections:

1. ✅ Verify all collections exist
2. ✅ Create storage buckets
3. ✅ Test the app functionality
4. ✅ Seed with sample data (optional)

```bash
# Verify collections
npm run appwrite:verify

# Seed sample data (if available)
npm run appwrite:seed
```

---

## Support

If you encounter issues:
1. Check the Appwrite Console for errors
2. Review the script output for specific error messages
3. Verify your API key has proper permissions
4. Check network connectivity to Appwrite

---

**Last Updated:** January 6, 2025
**Script Version:** 1.0.0
