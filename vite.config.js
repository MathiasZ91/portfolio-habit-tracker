import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000, // Set port to 3000
    hmr: {
      overlay: false, // Disable error overlay to prevent interference
    },
  },
});
