# Kijumbe Integration Guide

This guide explains how to integrate the Kijumbe rotational savings platform with the Rafiki Messenger application using Appwrite as the backend.

## Overview

The integration brings together:
- **Rafiki Messenger**: Real-time messaging, streaming, and wallet functionality
- **Kijumbe Savings**: Rotational savings groups and financial management
- **Appwrite Backend**: Unified authentication and database management

## Features Integrated

### 1. **Unified Authentication**
- Single sign-on using Appwrite
- User profiles stored in Appwrite database
- Role-based access control (Member, Kiongozi, Admin, SuperAdmin)

### 2. **Kijumbe Wallet Card**
- Embedded in Rafiki wallet page
- Real-time balance display
- Transaction history
- Savings goals management
- Group contributions tracking

### 3. **Database Structure**
- Users collection for profiles and roles
- Wallets collection for financial data
- Transactions collection for payment history
- Groups collection for savings groups
- Savings goals collection for personal targets

## Setup Instructions

### 1. **Appwrite Setup**

1. **Create Appwrite Project**
   ```bash
   # Install Appwrite CLI
   npm install -g appwrite-cli
   
   # Login to Appwrite
   appwrite login
   
   # Create new project
   appwrite projects create --projectId kijumbe-rafiki --name "Kijumbe Rafiki"
   ```

2. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp src/config/appwrite.env.example .env
   
   # Update with your Appwrite credentials
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_DATABASE_ID=kijumbe-database
   ```

3. **Create Database and Collections**
   ```javascript
   // Run this script to create the database structure
   node scripts/setup-appwrite-database.js
   ```

### 2. **Install Dependencies**

```bash
# Install Appwrite SDK
npm install appwrite

# Install additional dependencies
npm install axios bcryptjs jsonwebtoken
```

### 3. **Database Schema**

The integration uses the following Appwrite collections:

#### Users Collection
```json
{
  "email": "string",
  "name": "string", 
  "role": "member|kiongozi|admin|superadmin",
  "phone": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Wallets Collection
```json
{
  "user_id": "string",
  "balance": "number",
  "pin_set": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Transactions Collection
```json
{
  "user_id": "string",
  "type": "deposit|withdraw|contribution|refund",
  "amount": "number",
  "description": "string",
  "status": "pending|completed|failed",
  "group_id": "string?",
  "created_at": "datetime"
}
```

#### Groups Collection
```json
{
  "name": "string",
  "description": "string",
  "created_by": "string",
  "contribution_amount": "number",
  "frequency": "weekly|monthly",
  "max_members": "number",
  "status": "active|completed|paused",
  "created_at": "datetime"
}
```

#### Savings Goals Collection
```json
{
  "user_id": "string",
  "title": "string",
  "target_amount": "number",
  "current_amount": "number",
  "target_date": "datetime",
  "status": "active|completed|paused",
  "created_at": "datetime"
}
```

### 4. **Authentication Flow**

1. **User Registration**
   ```typescript
   const { register } = useAppwrite();
   const result = await register(email, password, name);
   ```

2. **User Login**
   ```typescript
   const { login } = useAppwrite();
   const result = await login(email, password);
   ```

3. **Role Management**
   ```typescript
   const { user } = useAppwrite();
   const isAdmin = user?.role === 'admin' || user?.isSuperAdmin;
   const isKiongozi = user?.role === 'kiongozi' || isAdmin;
   ```

### 5. **Wallet Integration**

The Kijumbe wallet is integrated as a card component in the Rafiki wallet page:

```tsx
// In src/pages/wallet/Wallet.tsx
import KijumbeWalletCard from '../../components/KijumbeWalletCard';

// Add to wallet page
<div className="p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Savings & Investments</h2>
  <KijumbeWalletCard />
</div>
```

### 6. **API Integration**

The integration uses Appwrite's built-in APIs:

```typescript
// Wallet operations
const wallet = await walletHelpers.getUserWallet(userId);
const transactions = await walletHelpers.getUserTransactions(userId);
const goals = await walletHelpers.getUserSavingsGoals(userId);

// Group operations
const groups = await groupHelpers.getUserGroups(userId);
const groupDetails = await groupHelpers.getGroupDetails(groupId);
```

## File Structure

```
src/
├── lib/
│   ├── appwrite.ts              # Appwrite configuration and helpers
│   └── payments.ts              # Existing payment system
├── contexts/
│   ├── AppwriteContext.tsx      # Appwrite authentication context
│   └── XMPPContext.tsx          # Existing XMPP context
├── components/
│   └── KijumbeWalletCard.tsx   # Kijumbe wallet card component
├── pages/
│   └── wallet/
│       └── Wallet.tsx           # Updated wallet page with Kijumbe card
└── config/
    └── appwrite.env.example     # Environment configuration template
```

## Testing the Integration

### 1. **Start the Development Server**
```bash
npm run dev
```

### 2. **Test Authentication**
- Navigate to `/login`
- Register a new user or login with existing credentials
- Verify user profile is created in Appwrite

### 3. **Test Wallet Integration**
- Navigate to `/wallet`
- Verify Kijumbe wallet card is displayed
- Test wallet operations (deposit, withdraw, view transactions)

### 4. **Test Role-Based Features**
- Create users with different roles
- Verify appropriate features are shown based on role

## Production Deployment

### 1. **Appwrite Production Setup**
- Set up production Appwrite instance
- Configure custom domain
- Set up SSL certificates
- Configure environment variables

### 2. **Database Migration**
- Export development data
- Import to production database
- Verify all collections and permissions

### 3. **Security Configuration**
- Enable Appwrite security features
- Configure CORS settings
- Set up rate limiting
- Enable audit logs

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Appwrite project ID and endpoint
   - Check user permissions in Appwrite console
   - Ensure collections exist and have proper permissions

2. **Wallet Data Not Loading**
   - Check if wallet document exists for user
   - Verify database permissions
   - Check browser console for errors

3. **Role-Based Access Issues**
   - Verify user role is set correctly in database
   - Check role-based conditional rendering
   - Ensure proper error handling

### Debug Mode

Enable debug mode by setting:
```typescript
// In src/lib/appwrite.ts
const APPWRITE_DEBUG = true;
```

## Support

For issues related to:
- **Appwrite**: Check [Appwrite Documentation](https://appwrite.io/docs)
- **Kijumbe Integration**: Check this guide and code comments
- **Rafiki Messenger**: Check existing documentation

## Next Steps

1. **Complete Appwrite Setup**: Set up production Appwrite instance
2. **Test All Features**: Comprehensive testing of all integrated features
3. **User Onboarding**: Create user onboarding flow
4. **Mobile App**: Consider mobile app integration
5. **Advanced Features**: Add more Kijumbe features like group management

## Contributing

When contributing to this integration:
1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Add tests for new features
5. Update documentation

---

This integration provides a solid foundation for combining messaging and financial services in a single platform. The modular design allows for easy extension and maintenance.
