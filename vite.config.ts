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
        target: 'https://kijumbesmart.co.tz',
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