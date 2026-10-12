// Validaciones del servidor. Replican las reglas del frontend, pero nunca se confía
// en el cliente: toda petición se vuelve a validar aquí.
// Cada validador devuelve un mensaje de error o "" si el valor es correcto.

export const EDAD_MINIMA = 18;
export const MAX_IMAGEN_BYTES = 700 * 1024;

const texto = (v) => (typeof v === "string" ? v.trim() : "");

export function calcularEdad(fechaIso, hoy = new Date()) {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  let edad = hoy.getFullYear() - anio;
  const diferenciaMes = hoy.getMonth() + 1 - mes;
  if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < dia)) edad--;
  return edad;
}

export function fechaIsoValida(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

export function validarNombre(v, etiqueta = "El nombre", max = 50) {
  const t = texto(v);
  if (!t) return `${etiqueta} es obligatorio.`;
  if (t.length > max) return `${etiqueta} no puede superar los ${max} caracteres.`;
  return "";
}

// Nombre de usuario para iniciar sesión (no es un correo): 3 a 30 caracteres, sin espacios.
export function validarUsuario(v) {
  const t = texto(v);
  if (!t) return "El usuario es obligatorio.";
  if (t.length < 3 || t.length > 30) return "El usuario debe tener entre 3 y 30 caracteres.";
  if (!/^[A-Za-z0-9._-]+$/.test(t)) return "Solo se permiten letras, números, punto, guion y guion bajo (sin espacios).";
  return "";
}

// Correo con formato válido (solo para el contacto y los datos de la compra, donde se necesita un correo real).
export function validarCorreo(v) {
  const t = texto(v);
  if (!t) return "El correo electrónico es obligatorio.";
  if (t.length > 100) return "El correo no debe superar los 100 caracteres.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "El correo no tiene un formato válido.";
  return "";
}

export const validarCorreoGeneral = validarCorreo;

export function validarFechaNacimiento(v, hoy = new Date()) {
  if (!fechaIsoValida(v)) return "La fecha de nacimiento no es válida.";
  if (calcularEdad(v, hoy) < EDAD_MINIMA) return `Debes ser mayor de ${EDAD_MINIMA} años.`;
  return "";
}

export function validarPassword(v) {
  if (typeof v !== "string" || !v) return "La contraseña es obligatoria.";
  if (v.length < 4 || v.length > 10) return "La contraseña debe tener entre 4 y 10 caracteres.";
  return "";
}

export function validarPrecio(v, { opcional = false } = {}) {
  if (opcional && (v === null || v === undefined || v === "")) return "";
  const n = Number(v);
  if (v === null || v === undefined || v === "" || !Number.isFinite(n)) return "El precio es obligatorio.";
  if (!Number.isInteger(n) || n <= 0) return "El precio debe ser un número entero mayor a 0.";
  if (n > 100_000_000) return "El precio es demasiado alto.";
  return "";
}

export function validarEnteroNoNegativo(v, etiqueta) {
  const n = Number(v);
  if (v === null || v === undefined || v === "" || !Number.isInteger(n) || n < 0) {
    return `${etiqueta} debe ser un número entero igual o mayor a 0.`;
  }
  if (n > 1_000_000) return `${etiqueta} es demasiado alto.`;
  return "";
}

// Acepta rutas del propio sitio ("img/..."), URLs https o imágenes subidas como data URL.
export function validarImagen(v) {
  if (v === "" || v === undefined || v === null) return "";
  if (typeof v !== "string") return "La imagen no es válida.";
  if (v.startsWith("data:")) {
    if (!/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v)) return "La imagen subida no es válida.";
    if (v.length > MAX_IMAGEN_BYTES * 1.37) return "La imagen es demasiado pesada.";
    return "";
  }
  if (/^https:\/\//.test(v) || /^img\/[\w.\-]+$/.test(v)) return "";
  return "La ruta de la imagen no es válida.";
}

export function validarFicha(v) {
  if (v === undefined || v === null) return "";
  if (!Array.isArray(v) || v.length > 20) return "La ficha técnica no es válida.";
  const ok = v.every(
    (f) =>
      f &&
      typeof f.etiqueta === "string" &&
      typeof f.valor === "string" &&
      f.etiqueta.length > 0 &&
      f.etiqueta.length <= 60 &&
      f.valor.length <= 300
  );
  return ok ? "" : "La ficha técnica no es válida.";
}

// Recibe { campo: "mensaje" } y devuelve solo los campos con error (o null si no hay ninguno).
export function soloErrores(mapa) {
  const errores = Object.fromEntries(Object.entries(mapa).filter(([, mensaje]) => mensaje));
  return Object.keys(errores).length ? errores : null;
}

export { texto };
