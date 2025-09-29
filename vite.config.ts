import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    global: 'globalThis',
    'process.env.VITE_APPWRITE_ENDPOINT': JSON.stringify('https://fra.cloud.appwrite.io/v1'),
    'process.env.VITE_APPWRITE_PROJECT_ID': JSON.stringify('68ac2652001ca468e987'),
    'process.env.VITE_APPWRITE_DATABASE_ID': JSON.stringify('68ac3f000002c33d8048'),
    'process.env.VITE_APPWRITE_API_KEY': JSON.stringify('standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498'),
    'process.env.VITE_FRONTEND_URL': JSON.stringify('https://93.127.203.151:2025')
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
        target: 'https://93.127.203.151:2025',
        changeOrigin: true,
        secure: true,
        ws: true
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
  },
});