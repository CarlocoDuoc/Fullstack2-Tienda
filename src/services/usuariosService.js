import { usuariosDB } from "../data/db";

const normalizar = (correo) => correo.trim().toLowerCase();

export function correoDisponible(correo, idExcluido = null) {
  return !usuariosDB
    .listar()
    .some((u) => normalizar(u.correo) === normalizar(correo) && Number(u.id) !== Number(idExcluido));
}

// Devuelve { ok: true, usuario } o { ok: false, error }
export function crearUsuario(datos) {
  if (!correoDisponible(datos.correo)) {
    return { ok: false, error: "Ya existe una cuenta con ese correo." };
  }
  const usuario = usuariosDB.crear({
    nombre: datos.nombre.trim(),
    correo: datos.correo.trim(),
    fechaNacimiento: datos.fechaNacimiento,
    password: datos.password,
    rol: datos.rol ?? "Cliente",
    estado: datos.estado ?? "Activo",
  });
  return { ok: true, usuario };
}

export function actualizarUsuario(id, cambios) {
  if (!correoDisponible(cambios.correo, id)) {
    return { ok: false, error: "Ya existe otra cuenta con ese correo." };
  }
  const usuario = usuariosDB.actualizar(id, {
    nombre: cambios.nombre.trim(),
    correo: cambios.correo.trim(),
    fechaNacimiento: cambios.fechaNacimiento,
    rol: cambios.rol,
    estado: cambios.estado,
  });
  return usuario ? { ok: true, usuario } : { ok: false, error: "El usuario no existe." };
}
