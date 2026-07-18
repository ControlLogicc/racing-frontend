import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://exceptions-modems-carter-governing.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://exceptions-modems-carter-governing.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});