import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Konfigurasi universal agar path JS/CSS benar di local & Railway
export default defineConfig({
  plugins: [react()],
  base: './', // ⚠️ sangat penting agar asset dipanggil relatif ke index.html
  build: {
    outDir: 'dist',
  },
})
