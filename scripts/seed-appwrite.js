const { Client, Databases, ID, Users, Query } = require('node-appwrite');
require('dotenv').config();

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const users = new Users(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;

// Test data
const testUsers = [
  {
    email: 'john@example.com',
    password: 'Password123!',
    name: 'John Doe',
    phone: '+255712345678',
    role: 'member'
  },
  {
    email: 'jane@example.com',
    password: 'Password123!',
    name: 'Jane Smith',
    phone: '+255723456789',
    role: 'member'
  },
  {
    email: 'admin@example.com',
    password: 'Password123!',
    name: 'Admin User',
    phone: '+255734567890',
    role: 'admin'
  }
];

const testGroups = [
  {
    name: 'Vikundi vya Kijumbe',
    description: 'Mikopo ya Kikundi cha Kijumbe',
    max_members: 12,
    rotation_duration: 30,
    contribution_amount: 25000,
    status: 'active'
  },
  {
    name: 'Mikopo ya Haraka',
    description: 'Mikopo ya haraka ya kikundi',
    max_members: 8,
    rotation_duration: 15,
    contribution_amount: 15000,
    status: 'active'
  },
  {
    name: 'Ushirika wa Kijumbe',
    description: 'Ushirika wa kijumbe wa muda mrefu',
    max_members: 15,
    rotation_duration: 45,
    contribution_amount: 30000,
    status: 'active'
  }
];

// Main function to seed database
async function seedAppwrite() {
  try {
    console.log('Starting Appwrite seeding...');
    
    // Create test users
    const createdUsers = [];
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUsers = await users.list([
          Query.equal('email', userData.email)
        ]);
        
        if (existingUsers.total > 0) {
          console.log(`User ${userData.email} already exists.`);
          createdUsers.push(existingUsers.users[0]);
          continue;
        }
        
        // Create user in Appwrite auth
        const user = await users.create(
          ID.unique(),
          userData.email,
          undefined, // Phone
          userData.password,
          userData.name
        );
        
        console.log(`Created user: ${user.name} (${user.$id})`);
        
        // Create user profile in database
        await databases.createDocument(
          databaseId,
          'users',
          user.$id,
          {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
        
        console.log(`Created user profile for: ${user.name}`);
        createdUsers.push(user);
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error);
      }
    }
    
    if (createdUsers.length === 0) {
      console.log('No users created. Exiting...');
      return;
    }
    
    // Create wallets for users
    for (const user of createdUsers) {
      try {
        // Check if wallet already exists
        const existingWallets = await databases.listDocuments(
          databaseId,
          'wallets',
          [Query.equal('user_id', user.$id)]
        );
        
        if (existingWallets.total > 0) {
          console.log(`Wallet for user ${user.name} already exists.`);
          continue;
        }
        
        // Create wallet
        const wallet = await databases.createDocument(
          databaseId,
          'wallets',
          ID.unique(),
          {
            user_id: user.$id,
            balance: 100000, // Start with 100,000 TZS
            pin_set: false,
            daily_limit: 1000000,
            monthly_limit: 10000000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
        
        console.log(`Created wallet for user: ${user.name}`);
        
        // Create initial deposit transaction
        await databases.createDocument(
          databaseId,
          'wallet_transactions',
          ID.unique(),
          {
            user_id: user.$id,
            wallet_id: wallet.$id,
            amount: 100000,
            type: 'deposit',
            status: 'completed',
            description: 'Initial deposit',
            service: 'general',
            created_at: new Date().toISOString()
          }
        );
        
        console.log(`Created initial deposit for user: ${user.name}`);
      } catch (error) {
        console.error(`Error creating wallet for user ${user.name}:`, error);
      }
    }
    
    // Create groups
    const adminUser = createdUsers.find(user => {
      return user.email === 'admin@example.com';
    });
    
    if (!adminUser) {
      console.log('Admin user not found. Skipping group creation...');
      return;
    }
    
    for (const groupData of testGroups) {
      try {
        // Check if group already exists
        const existingGroups = await databases.listDocuments(
          databaseId,
          'groups',
          [Query.equal('name', groupData.name)]
        );
        
        if (existingGroups.total > 0) {
          console.log(`Group ${groupData.name} already exists.`);
          continue;
        }
        
        // Create group
        const group = await databases.createDocument(
          databaseId,
          'groups',
          ID.unique(),
          {
            name: groupData.name,
            kiongozi_id: adminUser.$id,
            max_members: groupData.max_members,
            rotation_duration: groupData.rotation_duration,
            contribution_amount: groupData.contribution_amount,
            status: groupData.status,
            current_rotation: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: groupData.description
          }
        );
        
        console.log(`Created group: ${group.name}`);
        
        // Add admin as kiongozi (leader)
        await databases.createDocument(
          databaseId,
          'group_members',
          ID.unique(),
          {
            group_id: group.$id,
            user_id: adminUser.$id,
            role: 'kiongozi',
            rotation_position: 1,
            joined_at: new Date().toISOString()
          }
        );
        
        console.log(`Added ${adminUser.name} as kiongozi to group: ${group.name}`);
        
        // Add other users as members
        let position = 2;
        for (const user of createdUsers) {
          if (user.$id === adminUser.$id) continue;
          
          await databases.createDocument(
            databaseId,
            'group_members',
            ID.unique(),
            {
              group_id: group.$id,
              user_id: user.$id,
              role: 'member',
              rotation_position: position++,
              joined_at: new Date().toISOString()
            }
          );
          
          console.log(`Added ${user.name} as member to group: ${group.name}`);
          
          // Create contribution for this user
          await databases.createDocument(
            databaseId,
            'contributions',
            ID.unique(),
            {
              group_id: group.$id,
              user_id: user.$id,
              amount: groupData.contribution_amount,
              rotation: 1,
              status: 'completed',
              created_at: new Date().toISOString()
            }
          );
          
          console.log(`Created contribution for ${user.name} in group: ${group.name}`);
          
          // Create wallet transaction for contribution
          await databases.createDocument(
            databaseId,
            'wallet_transactions',
            ID.unique(),
            {
              user_id: user.$id,
              wallet_id: (await databases.listDocuments(
                databaseId,
                'wallets',
                [Query.equal('user_id', user.$id)]
              )).documents[0].$id,
              amount: groupData.contribution_amount,
              type: 'kijumbe_contribution',
              status: 'completed',
              description: `Contribution to ${group.name}`,
              service: 'kijumbe',
              reference_id: group.$id,
              created_at: new Date().toISOString()
            }
          );
          
          console.log(`Created wallet transaction for ${user.name}'s contribution`);
        }
      } catch (error) {
        console.error(`Error creating group ${groupData.name}:`, error);
      }
    }
    
    console.log('Appwrite seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding Appwrite:', error);
  }
}

// Run the seeding
seedAppwrite();
