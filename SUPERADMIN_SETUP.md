# Superadmin Setup Guide

This guide explains how to create and use a superadmin account in the Kijumbe application.

## What is a Superadmin?

A superadmin has **full access** to all features and pages in the application:

- ✅ **All User Pages**: Dashboard, Groups, Profile
- ✅ **All Kijumbe Pages**: Kijumbe Dashboard, Groups, Users  
- ✅ **All Admin Pages**: Admin Dashboard, Users, Groups
- ✅ **All System Features**: Complete system control
- ✅ **Bypass All Restrictions**: Access any page regardless of role requirements

## Creating a Superadmin

### Method 1: Using the Helper Script (Recommended)

1. **Make sure the backend is running:**
   ```bash
   npm start
   # or
   npm run dev
   ```

2. **Run the superadmin creation script:**
   ```bash
   node create-superadmin.js
   ```

3. **Login with the created credentials:**
   - Email: `superadmin@kijumbe.com`
   - Password: `superadmin123456`

### Method 2: Using the API Directly

1. **Make a POST request to:**
   ```
   POST http://localhost:3000/api/auth/create-superadmin
   ```

2. **With the following body:**
   ```json
   {
     "name": "Super Administrator",
     "email": "superadmin@kijumbe.com", 
     "password": "superadmin123456"
   }
   ```

### Method 3: Manual Database Creation

If you have direct access to your Appwrite database, create a user with:
- `role`: `"superadmin"`
- `isSuperAdmin`: `true`
- `permissions`: `["all"]`

## Superadmin Features

### 🔥 Visual Indicators
- **Sidebar**: Shows 🔥 emoji next to role
- **Profile Page**: Displays "🔥 Super Admin" badge
- **Navigation**: Access to all menu sections

### 🎯 Access Control
- **Frontend**: `ProtectedRoute` allows access to all pages
- **Backend**: All middleware checks include superadmin bypass
- **API**: All endpoints accessible regardless of role requirements

### 📱 Available Pages
1. **User Pages**
   - Dashboard
   - Groups (view and create)
   - Profile

2. **Kijumbe Pages** 
   - Kijumbe Dashboard
   - My Groups
   - Group Members

3. **Admin Pages**
   - Admin Dashboard
   - User Management
   - Group Management
   - System Statistics

## Security Notes

### Development vs Production
- **Development**: Superadmin creation is allowed via API
- **Production**: Superadmin creation is disabled for security

### Best Practices
1. **Change Default Password**: Update the default password immediately
2. **Use Strong Passwords**: Use complex passwords for superadmin accounts
3. **Limit Superadmin Count**: Only create superadmins when necessary
4. **Monitor Access**: Keep track of superadmin activities

## Troubleshooting

### "Superadmin creation not allowed in production"
- This is a security feature
- Create superadmin manually in the database for production

### "User with this email already exists"
- The superadmin already exists
- Use the existing credentials to login

### "Network error" when running the script
- Make sure the backend server is running on port 3000
- Check that the API endpoint is accessible

## Default Superadmin Credentials

```
Email: superadmin@kijumbe.com
Password: superadmin123456
```

**⚠️ Important**: Change these credentials after first login!

## Login URL

After creating the superadmin, login at:
```
http://localhost:3001/login
```

---

**Note**: Superadmin accounts have complete system access. Use responsibly and change default credentials immediately after creation.
