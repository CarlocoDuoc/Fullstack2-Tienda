import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" + HashRouter permiten publicar el sitio como archivos estáticos (Netlify, Vercel, GitHub Pages...).
// En desarrollo, las llamadas a /api se redirigen a la API local (server/, puerto 3001).
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
