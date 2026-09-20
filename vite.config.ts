import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
const base = process.env.BASE_PATH || "/";
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
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
        // Dice textures are prototype-only. Their code is tree-shaken from
        // normal releases, so keep them out of the install precache; the
        // prototype build keeps them for offline dice.
        globIgnores:
          process.env.VITE_DICE_PROTOTYPE === "1"
            ? []
            : ["**/paper-*.webp", "**/paper-bump-*.webp"],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
