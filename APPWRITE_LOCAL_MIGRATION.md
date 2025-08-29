# Appwrite Local Hosting Migration Guide

## 🚀 Prerequisites
- Docker
- Docker Compose
- Node.js 16+
- npm 8+

## 📦 Installation Steps

### 1. Install Appwrite Locally
```bash
# Create Appwrite project directory
mkdir appwrite-local
cd appwrite-local

# Download Appwrite Docker Compose
wget https://appwrite.io/install/compose.yml -O docker-compose.yml

# Start Appwrite services
docker-compose up -d
```

### 2. Access Appwrite Console
- Open browser: http://localhost:80
- Default credentials:
  - Email: admin@appwrite.io
  - Password: password

### 3. Create Project in Local Appwrite
1. Click "Create Project"
2. Name: Kijumbe Local
3. Note down Project ID and API Keys

### 4. Configure Collections
- Create following collections:
  1. users
  2. groups
  3. members
  4. transactions
  5. payments
  6. overdrafts
  7. whatsapp_messages

### 5. Set Up Attributes for Collections

#### Users Collection
- $id: Unique
- name: String
- phone: String (unique)
- email: String (unique)
- role: String (enum: admin, kiongozi, member)
- status: String

#### Groups Collection
- $id: Unique
- name: String
- kiongozi_id: Relationship to Users
- contribution_amount: Number
- max_members: Number
- rotation_duration: Number
- total_balance: Number

### 6. Update Environment Variables
```bash
# In your project's .env file
APPWRITE_ENDPOINT=http://localhost/v1
APPWRITE_PROJECT_ID=your_local_project_id
APPWRITE_API_KEY=your_local_api_key
```

### 7. Install Appwrite SDK
```bash
npm install appwrite
```

### 8. Appwrite Local Development Configuration
```javascript
// config/appwrite.js
const { Client, Databases, Query } = require('appwrite');

const client = new Client()
  .setEndpoint('http://localhost/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

module.exports = {
  client,
  databases,
  DATABASE_ID: 'your_database_id',
  COLLECTIONS: {
    USERS: 'users',
    GROUPS: 'groups',
    // ... other collections
  }
};
```

## 🔧 Troubleshooting
- Ensure Docker is running
- Check Appwrite console for any configuration issues
- Verify network ports (80, 443)

## 🚨 Security Notes
- Use strong, unique API keys
- Limit API key permissions
- Regularly rotate credentials

## 📝 Migration Checklist
- [ ] Install Docker
- [ ] Download Appwrite Compose
- [ ] Start Appwrite services
- [ ] Create local project
- [ ] Configure collections
- [ ] Update environment variables
- [ ] Test local connection

## 💡 Production Transition
When moving to production:
1. Replace localhost endpoints
2. Use cloud Appwrite credentials
3. Secure API keys
4. Configure proper access controls
