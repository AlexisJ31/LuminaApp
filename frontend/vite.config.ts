import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Forzando el reinicio del servidor Vite automáticamente
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
