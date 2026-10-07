import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" + HashRouter permiten publicar el sitio en GitHub Pages,
// Netlify o Vercel sin configurar rutas en el servidor.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
