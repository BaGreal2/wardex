import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ["**/splash-*.png"]
      },
      manifest: {
        name: "WARDEX",
        short_name: "WARDEX",
        theme_color: "#0C0C0C",
        background_color: "#0C0C0C",
        display: "standalone",
        start_url: "/auth",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 5173
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: ["wardex-vm.switzerlandnorth.cloudapp.azure.com"]
  }
});
