import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    // Listen on all addresses
    hmr: {
      overlay: false,
      protocol: 'ws',
      host: 'localhost',
      port: 3000
    },
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    }
  },
  // Disable service worker caching during development
  worker: {
    format: 'es'
  },
  // Force dependencies optimization
  optimizeDeps: {
    force: true
  }
});