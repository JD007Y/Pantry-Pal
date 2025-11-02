import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/pantry-pal/', // <-- IMPORTANT: Replace 'pantry-pal' with your repository name.
})