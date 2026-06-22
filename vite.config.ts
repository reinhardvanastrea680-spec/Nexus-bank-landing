import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = Number(process.env.PORT || "5173");

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: { chunkSizeWarningLimit: 1500 },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    // Force fresh responses — never serve 304 stale cache
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
    fs: { strict: true },
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
