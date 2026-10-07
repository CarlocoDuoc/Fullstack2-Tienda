import { usuariosDB } from "../data/db";

const CLAVE_SESION = "dino_sesion";
const normalizar = (correo) => correo.trim().toLowerCase();

// La sesión guarda solo lo necesario (nunca la contraseña).
const aSesion = ({ id, nombre, correo, rol }) => ({ id, nombre, correo, rol });

export function autenticar(correo, password) {
  const usuario = usuariosDB
    .listar()
    .find((u) => normalizar(u.correo) === normalizar(correo) && u.password === password);

  if (!usuario) return { ok: false, error: "Correo o contraseña incorrectos. Verifica tus datos." };
  if (usuario.estado === "Inactivo") {
    return { ok: false, error: "Tu cuenta está inactiva. Contacta a un administrador." };
  }

  const sesion = aSesion(usuario);
  window.localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  return { ok: true, usuario: sesion };
}

export function obtenerSesion() {
  try {
    return JSON.parse(window.localStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  window.localStorage.removeItem(CLAVE_SESION);
}
