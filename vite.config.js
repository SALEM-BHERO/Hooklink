import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        workspace: resolve(__dirname, 'workspace.html'),
        refinement: resolve(__dirname, 'refinement.html'),
        library: resolve(__dirname, 'library.html'),
      },
    },
  },
});
