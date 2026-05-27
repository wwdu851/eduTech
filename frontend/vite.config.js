import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/graphql': {
        target: 'https://edutech-2i8r.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})