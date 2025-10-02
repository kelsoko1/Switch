# 📖 Manual Setup Guide - Live Streaming Collections

## Why Manual Setup?

The Appwrite Web SDK cannot create collections automatically. Collections must be created through the Appwrite Console.

---

## 🎯 **Step-by-Step Instructions**

### **Step 1: Open Appwrite Console**

1. Go to: https://cloud.appwrite.io/console
2. Log in to your account
3. Select your project

### **Step 2: Navigate to Databases**

1. Click on **"Databases"** in the left sidebar
2. Click on your database (ID: `68ac3f000002c33d8048`)

### **Step 3: Create `live_streams` Collection**

#### **3.1 Create Collection**
1. Click **"Create Collection"** button
2. Enter Collection ID: `live_streams`
3. Enter Name: `Live Streams`
4. Click **"Create"**

#### **3.2 Add Attributes**

Click **"Attributes"** tab, then add each attribute:

| Attribute | Type | Size | Required | Default | Unique |
|-----------|------|------|----------|---------|--------|
| `streamId` | String | 255 | ✅ Yes | - | ✅ Yes |
| `title` | String | 255 | ✅ Yes | - | ❌ No |
| `streamerId` | String | 255 | ✅ Yes | - | ❌ No |
| `streamerName` | String | 255 | ✅ Yes | - | ❌ No |
| `streamerAvatar` | String | 2000 | ❌ No | - | ❌ No |
| `isLive` | Boolean | - | ✅ Yes | `true` | ❌ No |
| `viewerCount` | Integer | - | ✅ Yes | `0` | ❌ No |
| `likeCount` | Integer | - | ✅ Yes | `0` | ❌ No |
| `startedAt` | String | 50 | ✅ Yes | - | ❌ No |
| `endedAt` | String | 50 | ❌ No | - | ❌ No |

**For each attribute:**
1. Click **"Create Attribute"**
2. Select type (String/Boolean/Integer)
3. Enter attribute key (e.g., `streamId`)
4. Set size (for strings)
5. Check "Required" if needed
6. Set default value if needed
7. Check "Unique" for `streamId` only
8. Click **"Create"**

#### **3.3 Create Indexes**

Click **"Indexes"** tab, then create:

| Index Key | Type | Attributes | Order |
|-----------|------|------------|-------|
| `streamId_idx` | Unique | `streamId` | - |
| `streamerId_idx` | Key | `streamerId` | - |
| `isLive_idx` | Key | `isLive` | - |
| `createdAt_idx` | Key | `$createdAt` | DESC |

**For each index:**
1. Click **"Create Index"**
2. Enter index key
3. Select type (Unique or Key)
4. Select attribute(s)
5. Set order (DESC for createdAt)
6. Click **"Create"**

#### **3.4 Set Permissions**

Click **"Settings"** tab, then **"Permissions"**:

1. **Read**: Click "Add Role" → Select "Any" → Check "Read"
2. **Create**: Click "Add Role" → Select "Users" → Check "Create"
3. **Update**: Click "Add Role" → Select "Users" → Check "Update"
4. **Delete**: Click "Add Role" → Select "Users" → Check "Delete"

---

### **Step 4: Create `stream_comments` Collection**

#### **4.1 Create Collection**
1. Click **"Create Collection"** button
2. Enter Collection ID: `stream_comments`
3. Enter Name: `Stream Comments`
4. Click **"Create"**

#### **4.2 Add Attributes**

| Attribute | Type | Size | Required | Default | Unique |
|-----------|------|------|----------|---------|--------|
| `streamId` | String | 255 | ✅ Yes | - | ❌ No |
| `userId` | String | 255 | ✅ Yes | - | ❌ No |
| `userName` | String | 255 | ✅ Yes | - | ❌ No |
| `userAvatar` | String | 2000 | ❌ No | - | ❌ No |
| `message` | String | 500 | ✅ Yes | - | ❌ No |
| `timestamp` | String | 50 | ✅ Yes | - | ❌ No |

**Follow same process as Step 3.2**

#### **4.3 Create Indexes**

| Index Key | Type | Attributes | Order |
|-----------|------|------------|-------|
| `streamId_idx` | Key | `streamId` | - |
| `userId_idx` | Key | `userId` | - |
| `timestamp_idx` | Key | `timestamp` | ASC |

**Follow same process as Step 3.3**

#### **4.4 Set Permissions**

Same as Step 3.4:
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

---

## ✅ **Verification**

After creating both collections, verify:

1. **Check Collections List:**
   - ✅ `live_streams` appears in list
   - ✅ `stream_comments` appears in list

2. **Check Attributes:**
   - Open each collection
   - Click "Attributes" tab
   - Verify all attributes are listed

3. **Check Indexes:**
   - Click "Indexes" tab
   - Verify all indexes are created

4. **Check Permissions:**
   - Click "Settings" → "Permissions"
   - Verify roles are set correctly

---

## 🧪 **Test the Setup**

### **1. Restart Your Dev Server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

### **2. Test Live Streaming**

1. Navigate to `http://localhost:2025/streams`
2. Click the red **"+"** button (bottom right)
3. Click **"Go Live"**
4. Enter a stream title (e.g., "Test Stream")
5. Click **"Go Live"**

**Expected Results:**
- ✅ Camera preview appears
- ✅ No "Collection not found" errors in console
- ✅ Can send comments
- ✅ Can click like button
- ✅ Can toggle mic/camera
- ✅ Can end stream

### **3. Verify in Appwrite**

1. Go back to Appwrite Console
2. Open `live_streams` collection
3. Click **"Documents"** tab
4. **Expected:** See your test stream document

5. Open `stream_comments` collection
6. Click **"Documents"** tab
7. **Expected:** See your test comments

---

## 🎯 **Quick Reference**

### **Collection IDs:**
- `live_streams`
- `stream_comments`

### **Database ID:**
- `68ac3f000002c33d8048`

### **Appwrite Console:**
- https://cloud.appwrite.io/console

---

## 🆘 **Troubleshooting**

### **Issue: Can't find "Create Collection" button**

**Solution:**
- Make sure you're in the Databases section
- Make sure you've selected your database
- Check that you have proper permissions

### **Issue: Attribute creation fails**

**Solution:**
- Check attribute name (no spaces, camelCase)
- Verify size is appropriate
- Make sure type is correct

### **Issue: Still getting "Collection not found" errors**

**Solution:**
1. Verify collection IDs are exactly: `live_streams` and `stream_comments`
2. Check that collections are in the correct database
3. Restart your dev server
4. Clear browser cache

### **Issue: Permissions not working**

**Solution:**
1. Make sure you're logged in
2. Verify "Users" role has Create/Update permissions
3. Check that "Any" role has Read permission

---

## 📝 **Summary Checklist**

Before testing, make sure you have:

- [ ] Created `live_streams` collection
- [ ] Added all 10 attributes to `live_streams`
- [ ] Created 4 indexes for `live_streams`
- [ ] Set permissions for `live_streams`
- [ ] Created `stream_comments` collection
- [ ] Added all 6 attributes to `stream_comments`
- [ ] Created 3 indexes for `stream_comments`
- [ ] Set permissions for `stream_comments`
- [ ] Restarted dev server
- [ ] Tested live streaming feature

---

## 🎉 **Success!**

Once all collections are created, your live streaming feature will work perfectly!

**What works:**
- ✅ Stream creation
- ✅ Live comments
- ✅ Like system
- ✅ Mic/camera toggles
- ✅ Stream ending
- ✅ Data persistence

---

**Estimated Time:** 10-15 minutes

**Difficulty:** Easy (just follow the steps!)
