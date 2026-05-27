import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname), '')
  const graphqlTarget = env.VITE_GRAPHQL_PROXY || 'https://edutech-2i8r.onrender.com'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 3000,
      proxy: {
        '/graphql': {
          target: graphqlTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})