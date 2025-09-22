// Simple script to create server .env file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the server-env.txt file
const serverEnvConfig = fs.readFileSync(path.join(__dirname, 'server-env.txt'), 'utf8');

// Write to server/.env file
fs.writeFileSync(path.join(__dirname, 'server', '.env'), serverEnvConfig);
console.log('✅ Server .env file created successfully');

console.log('\n🚀 Server environment file created successfully!');
console.log('You can now run the server with:');
console.log('  cd server && npm run dev');
