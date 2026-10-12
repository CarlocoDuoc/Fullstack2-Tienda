// Capa de acceso a datos del frontend: un "CRUD" por entidad que habla con la API (Express + Neon).
// Ningún componente usa fetch directamente; todos pasan por aquí.
import { API_URL } from "../config";

const CLAVE_TOKEN = "dino_token";
export const EVENTO_SESION_EXPIRADA = "dino:sesion-expirada";

export class ApiError extends Error {
  constructor(estado, mensaje, campos = null) {
    super(mensaje);
    this.name = "ApiError";
    this.estado = estado;
    this.campos = campos;
  }
}

export function obtenerToken() {
  try {
    return localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export function guardarToken(token) {
  try {
    localStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    /* sin almacenamiento: la sesión dura hasta recargar */
  }
}

export function borrarToken() {
  try {
    localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    /* nada que borrar */
  }
}

// { q: "rex", oferta: true, vacio: "" } -> "?q=rex&oferta=true"
export function armarQuery(params = {}) {
  const partes = Object.entries(params)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== "" && valor !== false)
    .map(([clave, valor]) => `${encodeURIComponent(clave)}=${encodeURIComponent(valor)}`);
  return partes.length ? `?${partes.join("&")}` : "";
}

async function pedir(metodo, ruta, cuerpo) {
  const cabeceras = { Accept: "application/json" };
  const token = obtenerToken();
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  if (cuerpo !== undefined) cabeceras["Content-Type"] = "application/json";

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.");
  }

  if (respuesta.status === 204) return null;

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    /* respuesta sin JSON */
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) {
      borrarToken();
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }
    // Sin JSON y con error de servidor: casi siempre es que la API (carpeta server/) no está corriendo
    const sinApi = datos === null && respuesta.status >= 500;
    const mensaje = datos?.error ?? (sinApi ? "No se pudo conectar con la API. Revisa que esté corriendo (npm run dev dentro de server/)." : "Ocurrió un error inesperado.");
    throw new ApiError(respuesta.status, mensaje, datos?.campos ?? null);
  }
  return datos;
}

const get = (ruta) => pedir("GET", ruta);
const post = (ruta, cuerpo) => pedir("POST", ruta, cuerpo ?? {});
const put = (ruta, cuerpo) => pedir("PUT", ruta, cuerpo ?? {});
const del = (ruta) => pedir("DELETE", ruta);

export const api = {
  auth: {
    registro: (datos) => post("/api/auth/registro", datos),
    login: (datos) => post("/api/auth/login", datos),
    me: () => get("/api/auth/me"),
    perfil: (datos) => put("/api/auth/perfil", datos),
  },
  productos: {
    listar: (params) => get(`/api/productos${armarQuery(params)}`),
    obtener: (id) => get(`/api/productos/${id}`),
    criticos: () => get("/api/productos/criticos"),
    crear: (datos) => post("/api/productos", datos),
    actualizar: (id, datos) => put(`/api/productos/${id}`, datos),
    eliminar: (id) => del(`/api/productos/${id}`),
  },
  categorias: {
    listar: () => get("/api/categorias"),
    obtener: (id) => get(`/api/categorias/${id}`),
    crear: (datos) => post("/api/categorias", datos),
    actualizar: (id, datos) => put(`/api/categorias/${id}`, datos),
    eliminar: (id) => del(`/api/categorias/${id}`),
  },
  usuarios: {
    listar: () => get("/api/usuarios"),
    obtener: (id) => get(`/api/usuarios/${id}`),
    ordenes: (id) => get(`/api/usuarios/${id}/ordenes`),
    crear: (datos) => post("/api/usuarios", datos),
    actualizar: (id, datos) => put(`/api/usuarios/${id}`, datos),
    eliminar: (id) => del(`/api/usuarios/${id}`),
  },
  ordenes: {
    crear: (datos) => post("/api/ordenes", datos),
    mias: () => get("/api/ordenes/mias"),
    listar: (estado) => get(`/api/ordenes${armarQuery({ estado })}`),
    obtener: (id) => get(`/api/ordenes/${id}`),
  },
  contacto: {
    enviar: (datos) => post("/api/contacto", datos),
  },
  admin: {
    resumen: () => get("/api/admin/resumen"),
    reportes: () => get("/api/admin/reportes"),
    mensajes: () => get("/api/admin/mensajes"),
  },
};
