// Script to update environment variables for both frontend and server
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the template files
const serverEnvTemplate = fs.readFileSync(path.join(__dirname, 'server-env-template.txt'), 'utf8');
const frontendEnvTemplate = fs.readFileSync(path.join(__dirname, 'frontend-env-template.txt'), 'utf8');

// Write server .env file
fs.writeFileSync(path.join(__dirname, 'server', '.env'), serverEnvTemplate);
console.log('✅ Server .env file updated successfully');

// Write frontend .env.local file
fs.writeFileSync(path.join(__dirname, '.env.local'), frontendEnvTemplate);
console.log('✅ Frontend .env.local file updated successfully');

// Add additional environment variables for XMPP and Janus
const additionalEnv = `
# XMPP Configuration
VITE_XMPP_SERVER=ws://localhost:5280/ws
VITE_XMPP_DOMAIN=localhost
VITE_EJABBERD_WS_URL=ws://localhost:5280/ws
VITE_EJABBERD_DOMAIN=localhost
VITE_EJABBERD_API_URL=http://localhost:5280/api

# Janus WebRTC Configuration
VITE_USE_JANUS=false
VITE_JANUS_URL=wss://janus.conf.meetecho.com/ws
VITE_JANUS_JS_URL=https://janus.conf.meetecho.com/janus.js
`;

// Append additional environment variables to .env.local
fs.appendFileSync(path.join(__dirname, '.env.local'), additionalEnv);
console.log('✅ Added XMPP and Janus configuration to .env.local');

console.log('\n🚀 Environment files updated successfully!');
console.log('You can now run the application with:');
console.log('  npm run dev');
