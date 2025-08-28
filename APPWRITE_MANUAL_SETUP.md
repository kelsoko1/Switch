# 🗄️ Appwrite Manual Database Setup

Since the Appwrite SDK version 13.0.1 doesn't support automatic database creation, you'll need to set up the database manually in the Appwrite Console.

## 📋 Prerequisites

1. **Appwrite Project Created**: Ensure you have a project in Appwrite Console
2. **API Key Generated**: Create an API key with database permissions
3. **Project ID**: Note your project ID from the project settings

## 🗄️ Step 1: Create Database

1. Go to [Appwrite Console](https://console.appwrite.io/)
2. Select your project
3. Navigate to **Databases** in the left sidebar
4. Click **Create Database**
5. Fill in the details:
   - **Database ID**: `kijumbe_savings`
   - **Name**: `Kijumbe Rotational Savings`
   - **Description**: `Database for managing rotational savings groups`
6. Click **Create**

## 📊 Step 2: Create Collections

### Users Collection
1. In your database, click **Create Collection**
2. Fill in the details:
   - **Collection ID**: `users`
   - **Name**: `Users`
   - **Description**: `User profiles and authentication data`
3. Click **Create**
4. Add the following attributes:
   - `name` (string, required)
   - `email` (string, required, no array)
   - `phone` (string, required, no array)
   - `nida` (string, required, no array)
   - `role` (string, required, no array)
   - `status` (string, required, no array)
   - `created_at` (datetime, required, no array)

### Groups Collection
1. Create another collection:
   - **Collection ID**: `groups`
   - **Name**: `Savings Groups`
   - **Description**: `Rotational savings groups`
2. Add attributes:
   - `name` (string, required)
   - `kiongozi_id` (string, required, no array)
   - `max_members` (integer, required, no array)
   - `rotation_duration` (integer, required, no array)
   - `contribution_amount` (double, required, no array)
   - `status` (string, required, no array)
   - `current_rotation` (integer, required, no array)
   - `created_at` (datetime, required, no array)

### Members Collection
1. Create collection:
   - **Collection ID**: `members`
   - **Name**: `Group Members`
   - **Description**: `Group membership details`
2. Add attributes:
   - `group_id` (string, required, no array)
   - `user_id` (string, required, no array)
   - `member_number` (integer, required, no array)
   - `rotation_order` (integer, required, no array)
   - `status` (string, required, no array)
   - `joined_at` (datetime, required, no array)

### Transactions Collection
1. Create collection:
   - **Collection ID**: `transactions`
   - **Name**: `Financial Transactions`
   - **Description**: `Financial transaction records`
2. Add attributes:
   - `group_id` (string, required, no array)
   - `user_id` (string, required, no array)
   - `type` (string, required, no array)
   - `amount` (double, required, no array)
   - `description` (string, required, no array)
   - `status` (string, required, no array)
   - `created_at` (datetime, required, no array)

### Payments Collection
1. Create collection:
   - **Collection ID**: `payments`
   - **Name**: `Payment Records`
   - **Description**: `Payment processing records`
2. Add attributes:
   - `group_id` (string, required, no array)
   - `user_id` (string, required, no array)
   - `payment_type` (string, required, no array)
   - `amount` (double, required, no array)
   - `phone_number` (string, required, no array)
   - `payment_reference` (string, required, no array)
   - `description` (string, required, no array)
   - `status` (string, required, no array)
   - `created_at` (datetime, required, no array)

### Overdrafts Collection
1. Create collection:
   - **Collection ID**: `overdrafts`
   - **Name**: `Overdraft Records`
   - **Description**: `Loan and overdraft records`
2. Add attributes:
   - `group_id` (string, required, no array)
   - `user_id` (string, required, no array)
   - `amount` (double, required, no array)
   - `purpose` (string, required, no array)
   - `repayment_period` (integer, required, no array)
   - `status` (string, required, no array)
   - `interest_rate` (double, required, no array)
   - `created_at` (datetime, required, no array)

## 🔐 Step 3: Set Collection Permissions

For each collection, set the following permissions:

1. **Read**: `role:all` (allows public read access)
2. **Write**: `role:authenticated` (only authenticated users can write)
3. **Delete**: `role:authenticated` (only authenticated users can delete)

## 📝 Step 4: Create Indexes (Optional but Recommended)

### Users Collection
- Create index on `email` field for fast user lookups
- Create index on `phone` field for phone number searches

### Groups Collection
- Create index on `kiongozi_id` field for group leader queries
- Create index on `status` field for active/inactive group filtering

### Members Collection
- Create index on `group_id` field for group member queries
- Create index on `user_id` field for user membership queries

### Transactions Collection
- Create index on `group_id` field for group transaction queries
- Create index on `user_id` field for user transaction queries
- Create index on `created_at` field for date-based queries

## ✅ Step 5: Verify Setup

1. **Check Database**: Ensure `kijumbe_savings` database exists
2. **Check Collections**: Verify all 6 collections are created
3. **Check Attributes**: Ensure all required attributes are present
4. **Check Permissions**: Verify read/write permissions are set correctly

## 🚀 Step 6: Update Environment Variables

Ensure your `.env` file has the correct Appwrite configuration:

```bash
APPWRITE_ENDPOINT=https://your-appwrite-endpoint/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key_with_database_permissions
```

## 🔍 Step 7: Test Application

1. Start your application: `npm start`
2. Check the console for successful collection creation
3. Test the health endpoint: `http://localhost:3000/health`
4. Verify the frontend loads: `http://localhost:3000/`

## 🚨 Troubleshooting

### Collection Creation Fails
- Check API key permissions
- Verify project ID is correct
- Ensure endpoint URL is accessible

### Permission Errors
- Verify API key has `collections.write` permission
- Check collection permission settings
- Ensure user authentication is working

### Database Not Found
- Verify database ID matches exactly: `kijumbe_savings`
- Check if database exists in Appwrite Console
- Ensure you're in the correct project

## 📚 Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Database Management](https://appwrite.io/docs/products/databases)
- [Collection Management](https://appwrite.io/docs/products/databases/collections)
- [API Keys](https://appwrite.io/docs/products/databases/api-keys)

---

**🎯 After completing these steps, your Kijumbe application will be fully functional with Appwrite!**
