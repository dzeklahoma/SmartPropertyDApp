import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  resolve: {
    alias: {
      buffer: "buffer", // 👈 This tells Vite how to handle 'buffer' imports
    },
  },
  define: {
    global: "globalThis", // 👈 Required for some libraries expecting a Node-like global
  },
});
