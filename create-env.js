// Simple script to create .env file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the env-config.txt file
const envConfig = fs.readFileSync(path.join(__dirname, 'env-config.txt'), 'utf8');

// Write to .env file
fs.writeFileSync(path.join(__dirname, '.env'), envConfig);
console.log('✅ .env file created successfully');

// Write to .env.local file
fs.writeFileSync(path.join(__dirname, '.env.local'), envConfig);
console.log('✅ .env.local file created successfully');

console.log('\n🚀 Environment files created successfully!');
console.log('You can now run the application with:');
console.log('  npm run dev');
