import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://beast-brokers-accomplish-hidden.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});