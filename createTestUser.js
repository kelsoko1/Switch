import { Client, Users } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the client
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

// Generate a random test user
const randomId = Math.floor(1000 + Math.random() * 9000);
const testUser = {
    userId: `testuser_${randomId}`,
    email: `test_${randomId}@example.com`,
    password: 'Test@123',
    name: `Test User ${randomId}`
};

// Create the user
users.create(
    testUser.userId,
    testUser.email,
    null,
    testUser.password,
    testUser.name
)
.then(response => {
    console.log('Test user created successfully!');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
    console.log('User ID:', response.$id);
})
.catch(error => {
    console.error('Error creating test user:', error.message);
});
