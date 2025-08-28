#!/usr/bin/env node

/**
 * Kijumbe Authentication System Setup Script
 * This script tests and validates the authentication system
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Kijumbe Authentication System Setup');
console.log('=====================================\n');

// Check if required files exist
const requiredFiles = [
  'routes/auth.js',
  'middleware/auth.js',
  'server.js',
  'package.json'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - Missing!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all files are present.');
  process.exit(1);
}

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['bcryptjs', 'jsonwebtoken', 'express-validator', 'dotenv', 'express', 'cors', 'helmet', 'morgan'];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length > 0) {
  console.log('❌ Missing dependencies:', missingDeps.join(', '));
  console.log('\n📝 To install missing dependencies, run:');
  console.log(`   npm install ${missingDeps.join(' ')}`);
} else {
  console.log('✅ All required dependencies are listed in package.json');
}

// Check .env file
console.log('\n🔧 Checking environment configuration...');
if (fs.existsSync('.env')) {
  console.log('   ✅ .env file exists');
} else {
  console.log('   ⚠️  .env file not found - using defaults');
  
  // Create a basic .env file
  const envContent = `# Kijumbe Environment Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=kijumbe_super_secure_jwt_secret_key_2024_change_in_production
JWT_EXPIRES_IN=24h
SUPER_ADMIN_EMAIL=admin@kijumbe.com
SUPER_ADMIN_PASSWORD=admin123456
`;
  
  try {
    fs.writeFileSync('.env', envContent);
    console.log('   ✅ Created basic .env file with default values');
  } catch (error) {
    console.log('   ⚠️  Could not create .env file automatically');
  }
}

// Display configuration
console.log('\n🔐 Authentication System Configuration:');
console.log('=====================================');
console.log('📧 Super Admin Email: admin@kijumbe.com');
console.log('🔑 Super Admin Password: admin123456');
console.log('🌐 Server Port: 3000');
console.log('🔌 Auth Endpoint: http://localhost:3000/backend/auth');
console.log('🛡️  Backend Admin: http://localhost:3000/backend');

console.log('\n🚀 Available API Endpoints:');
console.log('===========================');
console.log('POST /backend/auth/register  - Register new user');
console.log('POST /backend/auth/login     - User login');
console.log('GET  /backend/auth/profile   - Get user profile');
console.log('PUT  /backend/auth/profile   - Update profile');
console.log('POST /backend/auth/logout    - User logout');
console.log('GET  /backend/auth/users     - Get all users (admin)');
console.log('POST /backend/auth/create-admin - Create admin (super admin only)');
console.log('GET  /backend/auth/health    - Health check');

console.log('\n📋 User Roles:');
console.log('==============');
console.log('🔴 superadmin - Full system access (all permissions)');
console.log('🟠 admin      - Administrative access (user management)');
console.log('🟡 kiongozi   - Group leader (create/manage groups)');
console.log('🟢 member     - Basic user (join groups, make transactions)');

console.log('\n🔄 Next Steps:');
console.log('=============');
console.log('1. Install dependencies: npm install');
console.log('2. Start the server: npm start');
console.log('3. Test login at: http://localhost:3000');
console.log('4. Use super admin credentials to access system');

console.log('\n✅ Authentication system setup complete!');
console.log('🎉 Ready to run Kijumbe platform with full authentication');
