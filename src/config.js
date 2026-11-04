// Configuración del frontend. `import.meta.env` lo define Vite al compilar.
const env = import.meta.env ?? {};

// URL base de la API, sin "/" final. Vacía = misma origen (proxy de Vite en desarrollo).
export const API_URL = String(env.VITE_API_URL ?? "").replace(/\/+$/, "");

// Carpeta base del sitio (para las imágenes de /public).
export const BASE_URL = env.BASE_URL ?? "./";

// ID de cliente de Google para "Iniciar sesión con Google" (es público, no es un secreto).
export const GOOGLE_CLIENT_ID = String(
  env.VITE_GOOGLE_CLIENT_ID ?? "303596453608-hdr9ke8bouuf3i040ven8sl13ovf8rg3.apps.googleusercontent.com"
);
