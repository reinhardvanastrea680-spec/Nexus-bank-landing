import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  // Always serve from root — hardcoded, never read from env vars
  base: "/",

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },

  root: path.resolve(import.meta.dirname),

  build: {
    chunkSizeWarningLimit: 1500,
    // Do NOT split Firebase — it has internal cross-references that break
    // when chunked separately in Rollup production builds
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Only split React — it's stable and has no cross-chunk issues
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }
          // Everything else (Firebase, wouter, etc.) goes in the main bundle
          // to avoid runtime cross-chunk reference errors
        },
      },
    },
  },

  server: {
    port: Number(process.env.PORT || "5173"),
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { strict: true },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
