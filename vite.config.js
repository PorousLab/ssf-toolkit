import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ssf-toolkit/',  // GitHub Pages base path
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
