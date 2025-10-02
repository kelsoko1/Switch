# 🚀 Automated Setup with Appwrite CLI

## Quick Start

I've created an automated script to set up all collections using the Appwrite CLI!

---

## 📋 **Prerequisites**

### **1. Install Appwrite CLI**

```bash
npm install -g appwrite-cli
```

### **2. Login to Appwrite**

```bash
appwrite login
```

You'll be prompted to:
1. Enter your Appwrite endpoint (default: https://cloud.appwrite.io/v1)
2. Enter your email
3. Enter your password

---

## ⚡ **Automated Setup**

### **For Windows:**

```bash
cd c:\Users\kelvin\Desktop\switch
scripts\setup-collections.bat
```

### **For Linux/Mac:**

```bash
cd /path/to/switch
chmod +x scripts/setup-collections.sh
./scripts/setup-collections.sh
```

---

## 🎯 **What the Script Does**

The script automatically:

1. ✅ Reads your `.env` file for configuration
2. ✅ Creates `live_streams` collection
3. ✅ Adds 10 attributes to `live_streams`
4. ✅ Creates 4 indexes for `live_streams`
5. ✅ Creates `stream_comments` collection
6. ✅ Adds 6 attributes to `stream_comments`
7. ✅ Creates 3 indexes for `stream_comments`
8. ✅ Sets proper permissions for all collections

**Total Time:** ~2 minutes (fully automated!)

---

## 📝 **Step-by-Step Instructions**

### **Step 1: Install Appwrite CLI**

Open your terminal and run:

```bash
npm install -g appwrite-cli
```

**Expected output:**
```
added 1 package in 5s
```

### **Step 2: Verify Installation**

```bash
appwrite --version
```

**Expected output:**
```
appwrite-cli/X.X.X
```

### **Step 3: Login to Appwrite**

```bash
appwrite login
```

**Follow the prompts:**
```
? Enter your Appwrite endpoint: https://cloud.appwrite.io/v1
? Enter your email: your-email@example.com
? Enter your password: ********
✓ Success Logged in successfully
```

### **Step 4: Run the Setup Script**

**On Windows:**
```bash
cd c:\Users\kelvin\Desktop\switch
scripts\setup-collections.bat
```

**On Linux/Mac:**
```bash
cd /path/to/switch
chmod +x scripts/setup-collections.sh
./scripts/setup-collections.sh
```

### **Step 5: Watch the Magic! ✨**

The script will:
```
🚀 Appwrite Live Streaming Setup
==================================

📊 Configuration:
  Project ID: your_project_id
  Database ID: 68ac3f000002c33d8048
  Endpoint: https://fra.cloud.appwrite.io/v1

✅ Appwrite CLI found

📹 Creating live_streams collection...
✓ Success

📝 Creating attributes for live_streams...
✓ Created streamId
✓ Created title
✓ Created streamerId
... (and so on)

🔍 Creating indexes for live_streams...
✓ Created streamId_idx
✓ Created streamerId_idx
... (and so on)

✅ live_streams collection created!

💬 Creating stream_comments collection...
... (same process)

🎉 Setup Complete!

✅ Collections created:
  - live_streams (with 10 attributes and 4 indexes)
  - stream_comments (with 6 attributes and 3 indexes)

🚀 Next steps:
  1. Restart your dev server: npm run dev
  2. Test live streaming at /streams

🎬 Your live streaming feature is ready!
```

### **Step 6: Restart Dev Server**

```bash
npm run dev
```

### **Step 7: Test Live Streaming**

1. Open http://localhost:2025/streams
2. Click the red "+" button
3. Click "Go Live"
4. Enter a title and start streaming!

---

## 🔧 **Troubleshooting**

### **Issue: "appwrite: command not found"**

**Solution:**
```bash
# Install globally
npm install -g appwrite-cli

# Verify installation
appwrite --version

# If still not found, add npm global bin to PATH
npm config get prefix
# Add the bin folder to your PATH
```

### **Issue: "Not logged in"**

**Solution:**
```bash
appwrite login
```

Follow the prompts to log in.

### **Issue: "Collection already exists"**

**Solution:**
This is fine! The script will skip existing collections.

If you want to recreate them:
1. Go to Appwrite Console
2. Delete the existing collections
3. Run the script again

### **Issue: "Permission denied" (Linux/Mac)**

**Solution:**
```bash
chmod +x scripts/setup-collections.sh
./scripts/setup-collections.sh
```

### **Issue: Script fails with "Invalid endpoint"**

**Solution:**
Check your `.env` file:
```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=68ac3f000002c33d8048
```

Make sure these values are correct.

---

## 🎯 **Manual Commands (Alternative)**

If you prefer to run commands manually:

### **Create live_streams collection:**

```bash
appwrite databases createCollection \
  --databaseId "68ac3f000002c33d8048" \
  --collectionId "live_streams" \
  --name "Live Streams" \
  --permissions 'read("any")' 'create("users")' 'update("users")' 'delete("users")'
```

### **Add attributes:**

```bash
# String attributes
appwrite databases createStringAttribute \
  --databaseId "68ac3f000002c33d8048" \
  --collectionId "live_streams" \
  --key "streamId" \
  --size 255 \
  --required true

# Boolean attributes
appwrite databases createBooleanAttribute \
  --databaseId "68ac3f000002c33d8048" \
  --collectionId "live_streams" \
  --key "isLive" \
  --required true \
  --default true

# Integer attributes
appwrite databases createIntegerAttribute \
  --databaseId "68ac3f000002c33d8048" \
  --collectionId "live_streams" \
  --key "viewerCount" \
  --required true \
  --default 0
```

### **Create indexes:**

```bash
appwrite databases createIndex \
  --databaseId "68ac3f000002c33d8048" \
  --collectionId "live_streams" \
  --key "streamId_idx" \
  --type "unique" \
  --attributes "streamId"
```

---

## 📚 **Appwrite CLI Documentation**

For more information:
- **CLI Docs:** https://appwrite.io/docs/command-line
- **Database Commands:** https://appwrite.io/docs/command-line/databases
- **GitHub:** https://github.com/appwrite/sdk-for-cli

---

## ✅ **Verification**

After running the script, verify in Appwrite Console:

1. Go to https://cloud.appwrite.io/console
2. Select your project
3. Navigate to Databases
4. Select your database
5. You should see:
   - ✅ `live_streams` collection
   - ✅ `stream_comments` collection

Click on each collection to verify:
- ✅ All attributes are present
- ✅ All indexes are created
- ✅ Permissions are set correctly

---

## 🎉 **Success!**

Once the script completes:

1. ✅ All collections are created
2. ✅ All attributes are configured
3. ✅ All indexes are set up
4. ✅ Permissions are correct
5. ✅ Your app is ready to use!

**Just restart your dev server and test!**

```bash
npm run dev
```

---

## 🚀 **Next Steps**

1. Test live streaming feature
2. Send some comments
3. Try the like button
4. Toggle mic/camera
5. End the stream
6. Check Appwrite Console to see your data!

---

**Estimated Time:** 5 minutes (including CLI installation)

**Difficulty:** Easy (fully automated!)
