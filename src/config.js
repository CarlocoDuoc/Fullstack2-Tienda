// Configuración del frontend. `import.meta.env` lo define Vite al compilar.
const env = import.meta.env ?? {};

// URL base de la API, sin "/" final. Vacía = misma origen (proxy de Vite en desarrollo).
export const API_URL = String(env.VITE_API_URL ?? "").replace(/\/+$/, "");

// Carpeta base del sitio (para las imágenes de /public).
export const BASE_URL = env.BASE_URL ?? "./";
