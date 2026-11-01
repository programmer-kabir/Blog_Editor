import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/sitemap.xml': 'http://localhost:3000',
      '/rss.xml': 'http://localhost:3000',
      '/feed.xml': 'http://localhost:3000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jodit') || id.includes('jodit-react')) {
              return 'editor-jodit';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'vendor-redux';
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            if (id.includes('react-router-dom') || id.includes('@remix-run')) {
              return 'vendor-router';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            return 'vendor-misc';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
