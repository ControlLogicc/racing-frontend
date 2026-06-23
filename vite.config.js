import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://consistent-incurred-fraser-magic.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});