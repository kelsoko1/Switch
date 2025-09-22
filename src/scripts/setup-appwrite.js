// Script to initialize Appwrite collections and run the app
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if .env file exists, if not create it with default values
const envPath = path.join(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating default .env file...');
  const defaultEnv = `
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_API_KEY=your-api-key
`;
  fs.writeFileSync(envPath, defaultEnv.trim());
  console.log('Created default .env file. Please update it with your Appwrite credentials.');
}

// Function to run a command and log output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log('Setting up Appwrite for Switch app...');
  
  // Install dependencies if needed
  if (!fs.existsSync(path.join(__dirname, '../../node_modules'))) {
    console.log('Installing dependencies...');
    runCommand('npm install');
  }
  
  // Run the initialization script
  console.log('Initializing Appwrite collections...');
  runCommand('node -r esm src/scripts/initializeAppwriteCollections.js');
  
  // Start the development server
  console.log('Starting development server...');
  runCommand('npm run dev');
}

// Run the main function
main().catch(error => {
  console.error('Error setting up Appwrite:', error);
  process.exit(1);
});
