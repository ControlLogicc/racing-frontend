import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://fool-collins-suzuki-testing.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});