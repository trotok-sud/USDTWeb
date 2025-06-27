import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/USDTWeb/', // GitHub Pages repo name (case-sensitive)
});
