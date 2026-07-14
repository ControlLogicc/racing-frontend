import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://optics-opened-lean-munich.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://optics-opened-lean-munich.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});