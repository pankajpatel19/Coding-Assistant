import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/index': 'http://localhost:3000',
      '/ask': 'http://localhost:3000',
      '/clear-history': 'http://localhost:3000',
    },
  },
})
