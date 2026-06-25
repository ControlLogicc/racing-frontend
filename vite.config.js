import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://investigate-jefferson-russell-handhelds.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});