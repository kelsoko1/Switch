# 🚀 SETUP REQUIRED - Read This First!

## ⚠️ **Your App Needs Database Collections**

The console errors you're seeing are because **Appwrite collections don't exist yet**.

---

## 🎯 **What You Need To Do**

### **Option 1: Manual Setup (Recommended) - 10 minutes**

Follow the detailed guide: **`MANUAL_SETUP_GUIDE.md`**

**Quick Steps:**
1. Open https://cloud.appwrite.io/console
2. Go to your database (`68ac3f000002c33d8048`)
3. Create 2 collections:
   - `live_streams` (with 10 attributes)
   - `stream_comments` (with 6 attributes)
4. Set permissions (Read: Any, Create/Update/Delete: Users)
5. Test your app!

---

## 📋 **Collection Details**

### **Collection 1: `live_streams`**

**Attributes:**
```
streamId        String(255)   Required  Unique
title           String(255)   Required
streamerId      String(255)   Required
streamerName    String(255)   Required
streamerAvatar  String(2000)  Optional
isLive          Boolean       Required  Default: true
viewerCount     Integer       Required  Default: 0
likeCount       Integer       Required  Default: 0
startedAt       String(50)    Required
endedAt         String(50)    Optional
```

**Indexes:**
- `streamId_idx` (unique on streamId)
- `streamerId_idx` (key on streamerId)
- `isLive_idx` (key on isLive)
- `createdAt_idx` (key on $createdAt, DESC)

---

### **Collection 2: `stream_comments`**

**Attributes:**
```
streamId     String(255)   Required
userId       String(255)   Required
userName     String(255)   Required
userAvatar   String(2000)  Optional
message      String(500)   Required
timestamp    String(50)    Required
```

**Indexes:**
- `streamId_idx` (key on streamId)
- `userId_idx` (key on userId)
- `timestamp_idx` (key on timestamp, ASC)

---

## ✅ **After Setup**

Once collections are created:

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Test live streaming:**
   - Go to `/streams`
   - Click "+" button
   - Click "Go Live"
   - Enter title and start streaming

3. **Verify it works:**
   - ✅ No "Collection not found" errors
   - ✅ Camera preview appears
   - ✅ Comments work
   - ✅ Like button works
   - ✅ Mic/camera toggles work

---

## 🐛 **Current Console Errors**

### **Critical (Must Fix):**
```
❌ Collection with the requested ID could not be found
   - live_streams
   - stream_comments
```
**Fix:** Create collections (see above)

### **Non-Critical (Can Ignore):**
```
⚠️ WebSocket connection to 'wss://xmpp.switch.app:5280/ws' failed
⚠️ WebSocket connection to 'wss://signaling.switch.app' failed
```
**These are expected** - XMPP and signaling servers are optional

---

## 📚 **Documentation**

I've created several guides for you:

1. **`MANUAL_SETUP_GUIDE.md`** - Detailed step-by-step instructions
2. **`QUICK_START_LIVE_STREAMING.md`** - Quick start guide
3. **`CONSOLE_ERRORS_EXPLAINED.md`** - Explanation of all errors
4. **`FIXES_APPLIED.md`** - Summary of code fixes

---

## 🎉 **What Works After Setup**

Your live streaming feature will be **fully functional**:

- ✅ Create streams with metadata
- ✅ Live camera preview
- ✅ Send and display comments
- ✅ Like system with persistence
- ✅ Toggle microphone on/off
- ✅ Toggle camera on/off
- ✅ End stream and save data
- ✅ All data persists to Appwrite

---

## 🆘 **Need Help?**

### **Can't create collections?**
- Check you have admin access to Appwrite project
- Make sure you're in the correct database
- Try refreshing the Appwrite Console

### **Still seeing errors after setup?**
- Verify collection IDs are exactly `live_streams` and `stream_comments`
- Check all attributes are created
- Restart your dev server
- Clear browser cache

### **Collections created but app not working?**
- Check `.env` file has correct database ID
- Verify you're logged in to the app
- Check browser console for specific errors

---

## 📞 **Quick Reference**

**Appwrite Console:** https://cloud.appwrite.io/console

**Database ID:** `68ac3f000002c33d8048`

**Collection IDs:**
- `live_streams`
- `stream_comments`

**Permissions:**
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

---

## ⏱️ **Time Estimate**

- **Manual Setup:** 10-15 minutes
- **Testing:** 5 minutes
- **Total:** ~20 minutes

---

## 🎯 **Next Steps**

1. ✅ Read `MANUAL_SETUP_GUIDE.md`
2. ✅ Create collections in Appwrite Console
3. ✅ Restart dev server
4. ✅ Test live streaming
5. ✅ Enjoy your working app!

---

**Start Here:** Open `MANUAL_SETUP_GUIDE.md` for detailed instructions!
