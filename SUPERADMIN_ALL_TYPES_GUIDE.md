# Superadmin Creation Guide for All Member Types

This guide explains how to create superadmin accounts for all three member types (member, kiongozi, and admin) in the Kijumbe system. Superadmins have full access to all features regardless of their member type.

## What are Superadmins?

Superadmins are special users that have access to all features in the system, regardless of their base role type. This means:

- A member superadmin has all the basic member features but also has access to all admin and kiongozi features
- A kiongozi superadmin has all kiongozi features but also has access to all admin features
- An admin superadmin has access to all admin features (this is the traditional superadmin)

## Default Superadmin Accounts

The scripts will create the following superadmin accounts:

| Type     | Email                           | Password        |
|----------|--------------------------------|----------------|
| Member   | member-superadmin@kijumbe.com  | superadmin123456 |
| Kiongozi | kiongozi-superadmin@kijumbe.com | superadmin123456 |
| Admin    | admin-superadmin@kijumbe.com   | superadmin123456 |

## How to Create Superadmin Accounts

### Option 1: Using the Batch Script (Windows)

1. Make sure your backend server is running at http://localhost:3000
2. Double-click on `create-all-superadmins.bat` or `create-all-superadmins-simple.bat`
3. Follow the prompts in the command window
4. All three superadmin accounts will be created

### Option 2: Using Node.js Directly

1. Make sure your backend server is running at http://localhost:3000
2. Open a terminal or command prompt
3. Run one of the following commands:
   ```
   node create-all-superadmins.js
   ```
   or
   ```
   node create-all-superadmins-simple.js
   ```
4. All three superadmin accounts will be created

## What's the Difference Between the Scripts?

- `create-all-superadmins.js` - Uses axios for HTTP requests (requires axios to be installed)
- `create-all-superadmins-simple.js` - Uses only Node.js built-in modules (no external dependencies)

## Logging In

After creating the superadmin accounts, you can log in at:
http://localhost:3001/login

Use the email and password from the table above for the type of superadmin you want to log in as.

## Security Notes

- These superadmin accounts are powerful and should be used with caution
- Change the default passwords after creation in a production environment
- The superadmin creation endpoint is disabled in production mode for security reasons

## Troubleshooting

If you encounter any issues:

1. Make sure the backend server is running at http://localhost:3000
2. Check that you have the necessary permissions to create users
3. If a superadmin already exists, the script will inform you and provide the login details
4. Check the console for any error messages
