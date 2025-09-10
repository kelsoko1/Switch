# Offline Mode Guide

This guide explains how to use the Kijumbe system in offline mode, including setting up a local Appwrite instance and creating superadmin accounts that work offline.

## What is Offline Mode?

Offline mode allows you to run the Kijumbe system without an internet connection by:

1. Using a local Appwrite instance instead of the cloud version
2. Bypassing SSL certificate validation
3. Creating superadmin accounts that work offline

## Setting Up Local Appwrite

### Prerequisites
- Docker Desktop must be installed and running
- Node.js and npm must be installed

### Installation Steps

1. Run the setup script:
   ```
   setup-appwrite-local.bat
   ```

2. Follow the instructions in the command prompt:
   - Wait for Appwrite to initialize (about 60 seconds)
   - Open http://localhost:80 in your browser
   - Login with default credentials:
     - Email: admin@appwrite.io
     - Password: password
   - Create a new project named 'Kijumbe Local'
   - Note down Project ID and API Keys

3. Create a `.env` file in your project root with the following:
   ```
   APPWRITE_ENDPOINT=http://localhost/v1
   APPWRITE_PROJECT_ID=your_local_project_id
   APPWRITE_API_KEY=your_local_api_key
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   ```

4. Create the necessary collections in Appwrite:
   - users
   - groups
   - members
   - transactions
   - payments
   - overdrafts
   - whatsapp_messages

## Creating Superadmin Accounts in Offline Mode

### Using the Batch Script

1. Run one of the following scripts:
   ```
   create-all-superadmins.bat
   ```
   or
   ```
   create-all-superadmins-simple.bat
   ```

2. When prompted "Do you want to run in offline mode?", type `y` and press Enter

3. The script will create superadmin accounts for all three member types:
   - Member Superadmin
   - Kiongozi Superadmin
   - Admin Superadmin

### Using Node.js Directly

You can also run the scripts directly with Node.js:

```
node create-all-superadmins.js --offline
```

or

```
node create-all-superadmins-simple.js --offline
```

## Superadmin Account Details

| Type     | Email                           | Password        |
|----------|--------------------------------|----------------|
| Member   | member-superadmin@kijumbe.com  | superadmin123456 |
| Kiongozi | kiongozi-superadmin@kijumbe.com | superadmin123456 |
| Admin    | admin-superadmin@kijumbe.com   | superadmin123456 |

## Troubleshooting Offline Mode

### Certificate Errors

If you encounter SSL certificate errors:

1. Make sure you're using the offline mode flag (`--offline`)
2. Verify that the script is setting `NODE_TLS_REJECT_UNAUTHORIZED=0`
3. Check that your local Appwrite instance is running

### Connection Errors

If you can't connect to the local Appwrite:

1. Ensure Docker is running
2. Check that the Appwrite containers are running with `docker ps`
3. Verify you can access the Appwrite console at http://localhost:80
4. Make sure your `.env` file has the correct configuration

### Login Errors

If you can't log in with the superadmin accounts:

1. Check if the accounts were created successfully
2. Verify that the backend server is running
3. Ensure the frontend is pointing to the correct backend URL
4. Check the browser console and server logs for errors

## Switching Between Online and Offline Modes

To switch between online and offline modes:

1. Update your `.env` file with the appropriate Appwrite endpoint:
   - Online: `APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1`
   - Offline: `APPWRITE_ENDPOINT=http://localhost/v1`

2. Update the project ID and API key accordingly

3. Restart your backend server

## Security Considerations

- Offline mode disables SSL certificate validation, which should NEVER be used in production
- The superadmin accounts created have powerful permissions - use them responsibly
- Change default passwords if using in a shared environment
