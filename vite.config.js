import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (
            id.includes('react-router') ||
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react'
          }
          return undefined
        },
      },
    },
  },
})
