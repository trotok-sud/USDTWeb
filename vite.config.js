// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/USDTWeb/', // 👈 this is crucial for GitHub Pages
  plugins: [react()],
});
