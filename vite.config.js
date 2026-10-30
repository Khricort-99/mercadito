import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
base: '/mercadito/',
  server: {
    port: 5173,
    host: true,
    open: false
  }
})
