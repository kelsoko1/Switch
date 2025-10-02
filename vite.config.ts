import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '');

  // Merge environment variables
  const envVars = {
    ...env,
    VITE_APPWRITE_ENDPOINT: 'https://fra.cloud.appwrite.io/v1',
    VITE_APPWRITE_PROJECT_ID: '68ac2652001ca468e987',
    VITE_APPWRITE_DATABASE_ID: '68ac3f000002c33d8048',
    VITE_APPWRITE_API_KEY: env.VITE_APPWRITE_API_KEY || '',
    VITE_FRONTEND_URL: 'https://kijumbesmart.co.tz',
    VITE_API_URL: 'https://kijumbesmart.co.tz/api',
    VITE_XMPP_SERVER: 'wss://kijumbesmart.co.tz/xmpp-ws',
    VITE_JANUS_WS_URL: 'wss://kijumbesmart.co.tz/janus-ws'
  };

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      }
    },
    define: {
      global: 'globalThis',
      'process.env': Object.fromEntries(
        Object.entries(envVars).map(([key, value]) => [key, JSON.stringify(value)])
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 2025,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:2026',
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/xmpp-ws': {
          target: 'ws://localhost:2027',
          ws: true,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/xmpp-ws/, '/ws')
        },
        '/janus-ws': {
          target: 'ws://localhost:2028',
          ws: true,
          changeOrigin: true,
          secure: false
        },
      },
    },
  };
});