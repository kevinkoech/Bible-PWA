import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Bible-PWA/', // 🔑 REQUIRED for GitHub Pages
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
