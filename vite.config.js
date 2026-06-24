import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
<<<<<<< HEAD
        target: 'http://localhost:8080',
=======
        target: 'https://aurora-motors-theft-queensland.trycloudflare.com',
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
        changeOrigin: true,
        secure: false,
      },
    },
  },
});