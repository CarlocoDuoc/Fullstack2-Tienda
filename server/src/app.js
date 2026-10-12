import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { consultar } from "./db.js";
import adminRutas from "./rutas/admin.js";
import authRutas from "./rutas/auth.js";
import categoriasRutas from "./rutas/categorias.js";
import contactoRutas from "./rutas/contacto.js";
import ordenesRutas from "./rutas/ordenes.js";
import productosRutas from "./rutas/productos.js";
import usuariosRutas from "./rutas/usuarios.js";
import { asyncHandler, manejarErrores, noEncontrada } from "./utils/errores.js";

export function crearApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    cors({
      // Solo los orígenes de CORS_ORIGIN pueden llamar a la API desde un navegador
      origin: (origen, cb) => cb(null, !origen || config.corsOrigenes.includes(origen)),
    })
  );
  app.use(express.json({ limit: "1mb" }));

  // Sirve para comprobar el servidor y "despertar" la base de Neon
  app.get(
    "/api/salud",
    asyncHandler(async (req, res) => {
      const { rows } = await consultar(
        "SELECT (SELECT COUNT(*)::int FROM productos) AS productos, (SELECT COUNT(*)::int FROM usuarios) AS usuarios, (SELECT COUNT(*)::int FROM categorias) AS categorias"
      );
      res.json({ ok: true, ...rows[0] });
    })
  );

  app.use("/api/auth", authRutas);
  app.use("/api/productos", productosRutas);
  app.use("/api/categorias", categoriasRutas);
  app.use("/api/usuarios", usuariosRutas);
  app.use("/api/ordenes", ordenesRutas);
  app.use("/api/contacto", contactoRutas);
  app.use("/api/admin", adminRutas);

  app.use(noEncontrada);
  app.use(manejarErrores);
  return app;
}
