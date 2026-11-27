import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import agentcue from "agentcue/vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), agentcue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        privacy: resolve(__dirname, "privacy/index.html"),
        terms: resolve(__dirname, "terms/index.html"),
        support: resolve(__dirname, "support/index.html"),
      },
    },
  },
});
