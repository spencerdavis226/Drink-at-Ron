import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
const base = process.env.BASE_PATH || "/";
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      // An installed Home Screen app has no refresh control, so a waiting
      // worker would strand the icon on an old build until a reinstall.
      // autoUpdate activates the new worker (skipWaiting + clientsClaim) as
      // soon as it is fully cached: the running page keeps its session and
      // offers a reload, while every later launch or refresh serves the latest.
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png", "art/*.svg"],
      manifest: {
        id: base,
        name: "Drink at Ron",
        short_name: "Drink at Ron",
        description: "A little luck. A good crowd. One more card.",
        start_url: base,
        scope: base,
        display: "standalone",
        orientation: "portrait",
        theme_color: "#17100c",
        background_color: "#17100c",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webp,avif,woff2}"],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
