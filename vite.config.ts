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
    port: 2025,
    host: true,
    proxy: {
      '/api': 'http://localhost:2025',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
  },
});