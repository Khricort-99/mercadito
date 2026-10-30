import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, isPreview }) => {
  const isVercel = process.env.VERCEL === '1'
  const base =
    process.env.VITE_BASE_PATH ||
    (isVercel ? '/' : command === 'build' || isPreview ? '/mercadito/' : '/')

  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: true,
      open: false
    }
  }
})
