import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isCi = process.env.CI === 'true'
  const isHeadless = process.env.VITE_HEADLESS === 'true'

  return {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer,
        ],
      },
    },
    // Headless and CI mode configurations
    server: {
      ...(isHeadless ? { 
        headless: true 
      } : {})
    },
    build: {
      outDir: 'build',
      emptyOutDir: true,
      // Disable console warnings in CI
      ...(isCi ? { 
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      } : {}),
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    // Ensure public directory is set
    publicDir: 'public'
  }
})
