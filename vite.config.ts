import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      global: 'globalThis',
      'process.env': {
        ...env,
        VITE_APPWRITE_ENDPOINT: JSON.stringify('https://fra.cloud.appwrite.io/v1'),
        VITE_APPWRITE_PROJECT_ID: JSON.stringify('68ac2652001ca468e987'),
        VITE_APPWRITE_DATABASE_ID: JSON.stringify('68ac3f000002c33d8048'),
        VITE_APPWRITE_API_KEY: JSON.stringify('standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498'),
        VITE_FRONTEND_URL: JSON.stringify('https://kijumbesmart.co.tz'),
        VITE_API_URL: JSON.stringify('https://kijumbesmart.co.tz/api'),
        VITE_XMPP_SERVER: JSON.stringify('wss://kijumbesmart.co.tz/xmpp-ws'),
        VITE_JANUS_WS_URL: JSON.stringify('wss://kijumbesmart.co.tz/janus-ws'),
      },
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
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: true,
    },
  };
});