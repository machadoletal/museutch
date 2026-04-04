import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Para hospedar no GitHub Pages em subpasta, defina base: '/museutch/'
// Para raiz do domínio (Netlify, Vercel, domínio próprio), mantenha base: '/'
export default defineConfig({
  plugins: [react()],
  base: '/museutch/',
})
