import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Habit Tracker App',
        short_name: 'Habit Tracker',
        description: 'Track your daily habits and goals',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
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
  worker: {
    format: 'es'
  },
  optimizeDeps: {
    force: true
  }
});