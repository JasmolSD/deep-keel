import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // This handles the SPA routing during development
    historyApiFallback: true,
  },
  preview: {
    // This handles it for `vite preview` (production preview)
    historyApiFallback: true,
  }
})