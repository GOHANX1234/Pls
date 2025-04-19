import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> d58fe253f52b05bef743fb1a14ad74a9478dabed
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
<<<<<<< HEAD
=======
=======
>>>>>>> accf0f702726880a6fe0d3936dcc876725bab297
>>>>>>> d58fe253f52b05bef743fb1a14ad74a9478dabed
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
        },
      },
    },
  },
})