import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    open: false
  }
}))
