import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["vite.svg", "icon-192.png", "icon-512.png"],
      workbox: {
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30MB for ORT WASM
        globPatterns: ["**/*.{js,css,html,png,svg,ico,webmanifest}"],
        globIgnores: ["**/*.wasm", "**/*.mjs", "**/ort/**", "**/mediapipe/**"],
      },
      manifest: {
        name: "证件照生成器",
        short_name: "IDPhoto",
        description: "在线证件照生成工具，支持多种证件规格与背景颜色",
        theme_color: "#4A90D9",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
