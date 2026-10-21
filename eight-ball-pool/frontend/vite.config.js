/**
 * FILE: 3d-toys/eight-ball-pool/frontend/vite.config.js
 * PURPOSE: build 8-Ball into eight-ball-pool/dist for toy box server
 * UI: 8-Ball (whole page)
 * USED BY: npm run dev / build (eight-ball-pool/package.json), npm run build:pool (3d-toys)
 * KEY EXPORTS: default (Vite config)
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig( {
  plugins: [ react() ],
  // relative asset paths so bundle runs under /3d-toys/eight-ball-pool/
  base: './',
  root: import.meta.dirname,
  worker: { format: 'es' },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // one app chunk ~850 kB (three + react): expected
    chunkSizeWarningLimit: 1000,
  },
  server: { port: 5183 },
} )
