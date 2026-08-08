import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Redirect all 404s back to index.html so React Router handles the route
    historyApiFallback: true,
  },
  preview: {
    // Same fix for `vite preview` (production preview mode)
    historyApiFallback: true,
  },
})
