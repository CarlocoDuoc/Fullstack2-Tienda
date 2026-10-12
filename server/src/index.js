import { crearApp } from "./app.js";
import { config } from "./config.js";

// Falla al arrancar (y no en la primera petición) si faltan las variables obligatorias
void config.databaseUrl;
void config.jwtSecret;

crearApp().listen(config.puerto, () => {
  console.log(`API de Dino Rancho escuchando en http://localhost:${config.puerto}`);
});
