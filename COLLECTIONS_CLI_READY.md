# ✅ Appwrite Collections CLI Tool - Ready!

## 🎉 What's Been Created

I've created a comprehensive CLI tool to verify and set up all required Appwrite collections for your Switch app.

---

## 📋 Required Collections

The tool will check and create these 9 collections:

1. ✅ **live_streams** - Live streaming sessions
2. ✅ **stream_comments** - Stream chat comments  
3. ✅ **status_updates** - WhatsApp-style 24h stories
4. ✅ **videos** - Uploaded video content
5. ✅ **shorts** - Short-form videos (60s max)
6. ✅ **groups** - Chat & savings groups
7. ✅ **messages** - Chat messages
8. ✅ **wallets** - User wallet data
9. ✅ **transactions** - Transaction history

---

## 🚀 How to Use

### Step 1: Set Your API Key

Add your Appwrite API key to `.env`:

```env
VITE_APPWRITE_API_KEY=your_api_key_here
```

**Where to get your API key:**
1. Go to Appwrite Console
2. Navigate to your project
3. Go to Settings → API Keys
4. Create a new API key with these scopes:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `attributes.read`
   - `attributes.write`
   - `indexes.read`
   - `indexes.write`

### Step 2: Run the Verification

```bash
npm run appwrite:verify
```

### Step 3: Follow the Prompts

The script will:
1. ✅ Connect to your Appwrite instance
2. ✅ Check which collections exist
3. ✅ List missing collections
4. ✅ Ask if you want to create them
5. ✅ Create all missing collections automatically

---

## 📖 Example Output

```
============================================================
🚀 Appwrite Collections Verification Tool
============================================================

ℹ Connected to Appwrite
ℹ Endpoint: https://fra.cloud.appwrite.io/v1
ℹ Project: 68ac2652001ca468e987
ℹ Database: 68ac3f000002c33d8048

📋 Verifying Appwrite Collections

✓ Live Streams (live_streams)
✗ Stream Comments (stream_comments) - MISSING
✗ Status Updates (status_updates) - MISSING
...

============================================================
📊 Summary
============================================================

✓ Existing collections: 3/9
⚠ Missing collections: 6
  stream_comments, status_updates, videos, shorts, messages, transactions

Do you want to create the missing collections? (yes/no): yes

ℹ Creating collection: Stream Comments (stream_comments)
✓ Collection created: Stream Comments
  Adding attribute: streamId (string)
  Adding attribute: userId (string)
  ...
✓ Collection Stream Comments setup complete

============================================================
✅ Creation Complete
============================================================

✓ Created 6 collections:
  - stream_comments
  - status_updates
  - videos
  - shorts
  - messages
  - transactions
```

---

## 🎨 Features

### Automatic Collection Creation
- Creates all collections with proper schema
- Adds all required attributes
- Sets up indexes for performance
- Configures permissions

### Smart Verification
- Checks existing collections
- Only creates missing ones
- Handles errors gracefully
- Provides detailed feedback

### Interactive Prompts
- Asks before making changes
- Shows progress for each step
- Color-coded output
- Clear error messages

---

## 📚 Documentation

### Collection Details
See `APPWRITE_COLLECTIONS_GUIDE.md` for:
- Complete attribute specifications
- Index configurations
- Permission settings
- Usage examples

### Script Location
- **File:** `scripts/verify-collections.js`
- **Command:** `npm run appwrite:verify`
- **Type:** ES Module

---

## 🔧 Troubleshooting

### Error: "API key not found"
**Solution:**
```bash
# Add to .env file
VITE_APPWRITE_API_KEY=your_key_here
```

### Error: "Permission denied"
**Solution:** Your API key needs these scopes:
- databases.write
- collections.write
- attributes.write
- indexes.write

### Error: "Collection already exists"
**Solution:** The collection exists! The script will skip it.

### Collections not appearing in app
**Solution:**
1. Verify: `npm run appwrite:verify`
2. Check collection IDs match in code
3. Verify permissions (Read: Any, Create/Update/Delete: Users)

---

## 🎯 What Each Collection Does

### live_streams
Stores active and past live streaming sessions with viewer counts, likes, and metadata.

### stream_comments
Real-time chat comments during live streams.

### status_updates
WhatsApp-style 24-hour stories with text, images, or videos.

### videos
Full-length uploaded videos with categories, tags, and analytics.

### shorts
Short-form vertical videos (max 60 seconds).

### groups
Chat groups and Kijumbe savings groups with member management.

### messages
Chat messages with timestamps and read status.

### wallets
User wallet balances, limits, and Kijumbe savings.

### transactions
Complete transaction history with status tracking.

---

## ✨ Next Steps

After running the verification:

1. **Verify Success**
   ```bash
   npm run appwrite:verify
   ```
   Should show: "✨ All required collections exist!"

2. **Create Storage Bucket**
   - Go to Appwrite Console → Storage
   - Create bucket with ID: `videos`
   - Set max size: 500MB
   - Allow: video/*, image/*

3. **Test the App**
   ```bash
   npm run dev
   ```

4. **Deploy**
   ```bash
   npm run build
   npm run deploy:docker
   ```

---

## 📝 Files Created

1. `scripts/verify-collections.js` - CLI verification tool
2. `APPWRITE_COLLECTIONS_GUIDE.md` - Detailed documentation
3. `COLLECTIONS_CLI_READY.md` - This file

---

## 🎊 Summary

You now have a professional CLI tool that:
- ✅ Verifies all 9 required collections
- ✅ Creates missing collections automatically
- ✅ Sets up proper schemas and indexes
- ✅ Provides clear feedback and error handling
- ✅ Works with your existing Appwrite setup

**Just run:** `npm run appwrite:verify` and follow the prompts!

---

**Created:** January 6, 2025
**Status:** ✅ Ready to Use
**Command:** `npm run appwrite:verify`
