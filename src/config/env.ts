// Environment Configuration
export const env = {
  // Appwrite Configuration
  APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID || '68ac2652001ca468e987',
  APPWRITE_DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID || '68ac3f000002c33d8048',
  
  // App Configuration
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.DEV || false,
  IS_PRODUCTION: import.meta.env.PROD || false,
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://93.127.203.151:2025',
  
  // WebSocket Configuration
  WS_ENABLED: import.meta.env.VITE_WS_ENABLED !== 'false',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://93.127.203.151:2025/ws',
} as const;
