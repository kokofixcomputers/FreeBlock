import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /FreeBlock/; local dev stays at /.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/FreeBlock/' : '/',
  plugins: [react()],
}));
