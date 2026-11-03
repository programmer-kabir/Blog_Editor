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
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
})
