import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Build-time image optimization. Imports under src/assets/photos with
    // ?w=...&format=webp run through sharp at build time and ship as
    // small, modern-format files. Originals are 3-15MB JPEGs; outputs
    // are typically <300KB.
    imagetools({
      defaultDirectives: (url) => {
        // Default everything in src/assets/photos to a 1600w WebP at
        // quality 78 — a single optimized version per photo, fed into
        // <img src> directly. Override per-import for special cases.
        if (url.pathname.includes("/assets/photos/")) {
          return new URLSearchParams({
            w: "1600",
            format: "webp",
            quality: "78",
          });
        }
        return new URLSearchParams();
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
