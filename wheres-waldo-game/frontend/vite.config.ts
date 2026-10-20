import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the bundle also runs under /3d-toys/wheres-waldo-game/
  base: './',
  // Config lives in frontend/; build to repo-root dist/ where the server serves it
  root: import.meta.dirname,
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    // The game server owns /ws; Vite proxies it so dev runs on one origin.
    proxy: { '/ws': { target: 'ws://localhost:8787', ws: true } }
  }
});
