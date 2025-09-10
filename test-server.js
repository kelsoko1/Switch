// Simple test server to check if dependencies work
console.log('Testing server dependencies...');

try {
  const express = require('express');
  console.log('✅ Express loaded successfully');
  
  const cors = require('cors');
  console.log('✅ CORS loaded successfully');
  
  const dotenv = require('dotenv');
  console.log('✅ Dotenv loaded successfully');
  
  const helmet = require('helmet');
  console.log('✅ Helmet loaded successfully');
  
  const morgan = require('morgan');
  console.log('✅ Morgan loaded successfully');
  
  const bcryptjs = require('bcryptjs');
  console.log('✅ bcryptjs loaded successfully');
  
  const jwt = require('jsonwebtoken');
  console.log('✅ jsonwebtoken loaded successfully');
  
  const { body, validationResult } = require('express-validator');
  console.log('✅ express-validator loaded successfully');
  
  const { Client, Databases } = require('appwrite');
  console.log('✅ Appwrite loaded successfully');
  
  const axios = require('axios');
  console.log('✅ Axios loaded successfully');
  
  console.log('\n🎉 All dependencies loaded successfully!');
  console.log('The server should work now.');
  
} catch (error) {
  console.log('❌ Error loading dependencies:', error.message);
  console.log('Missing module:', error.message.split("'")[1] || 'Unknown');
}
