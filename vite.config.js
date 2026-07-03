import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://collectibles-dividend-fully-acc.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://collectibles-dividend-fully-acc.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});