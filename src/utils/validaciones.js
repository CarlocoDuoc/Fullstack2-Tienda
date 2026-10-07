// Reglas de validación del proyecto. Cada validador recibe un valor y devuelve
// un mensaje de error, o "" cuando el valor es correcto.

export const DOMINIO_CORREO = "@duocuc.cl";
export const EDAD_MINIMA = 18;
export const TAMANO_MAX_IMAGEN = 512 * 1024; // 512 KB (localStorage tiene ~5 MB en total)

export function calcularEdad(fechaIso, hoy = new Date()) {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  let edad = hoy.getFullYear() - anio;
  const diferenciaMes = hoy.getMonth() + 1 - mes;
  if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < dia)) edad--;
  return edad;
}

export function validarNombre(valor) {
  const texto = valor.trim();
  if (!texto) return "El nombre es obligatorio.";
  if (texto.length > 50) return "El nombre no puede superar los 50 caracteres.";
  return "";
}

export function validarCorreo(valor) {
  const texto = valor.trim();
  if (!texto) return "El correo electrónico es obligatorio.";
  if (texto.length > 100) return "El correo no debe superar los 100 caracteres.";
  if (!texto.toLowerCase().endsWith(DOMINIO_CORREO)) return `Debe terminar en ${DOMINIO_CORREO}`;
  return "";
}

export function validarFechaNacimiento(valor, hoy = new Date()) {
  if (!valor) return "La fecha de nacimiento es obligatoria.";
  if (calcularEdad(valor, hoy) < EDAD_MINIMA) {
    return `Debes ser mayor de ${EDAD_MINIMA} años para hacer compras en el rancho.`;
  }
  return "";
}

export function validarPassword(valor) {
  if (!valor) return "La contraseña es obligatoria.";
  if (valor.length < 4 || valor.length > 10) return "La contraseña debe tener entre 4 y 10 caracteres.";
  return "";
}

export function validarConfirmPassword(password, confirmacion) {
  if (!confirmacion) return "Debes confirmar la contraseña.";
  if (password !== confirmacion) return "Las contraseñas no coinciden.";
  return "";
}

export function validarTerminos(aceptado) {
  return aceptado ? "" : "Debes aceptar los términos y condiciones.";
}

export function validarNombreProducto(valor) {
  const texto = valor.trim();
  if (!texto) return "El nombre del producto es obligatorio.";
  if (texto.length > 100) return "El nombre no puede superar los 100 caracteres.";
  return "";
}

export function validarPrecio(valor) {
  if (valor === "" || valor === null || valor === undefined) return "El precio es obligatorio.";
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) return "El precio debe ser un número mayor a 0.";
  if (!Number.isInteger(numero)) return "El precio debe ser un número entero (pesos chilenos).";
  if (numero > 100000000) return "El precio es demasiado alto.";
  return "";
}

export function validarDescripcion(valor) {
  const texto = valor.trim();
  if (!texto) return "La descripción es obligatoria.";
  if (texto.length > 300) return "La descripción no puede superar los 300 caracteres.";
  return "";
}

export function validarImagen(archivo) {
  if (!archivo.type.startsWith("image/")) return "El archivo debe ser una imagen.";
  if (archivo.size > TAMANO_MAX_IMAGEN) return "La imagen no puede pesar más de 512 KB.";
  return "";
}

// --- Validadores por formulario: devuelven { campo: mensaje } ---

export const validarFormularioLogin = (v) => ({
  correo: validarCorreo(v.correo),
  password: validarPassword(v.password),
});

export const validarFormularioRegistro = (v) => ({
  nombre: validarNombre(v.nombre),
  correo: validarCorreo(v.correo),
  fechaNacimiento: validarFechaNacimiento(v.fechaNacimiento),
  password: validarPassword(v.password),
  confirmPassword: validarConfirmPassword(v.password, v.confirmPassword),
  terminos: validarTerminos(v.terminos),
});

export const validarFormularioUsuarioNuevo = (v) => ({
  nombre: validarNombre(v.nombre),
  correo: validarCorreo(v.correo),
  fechaNacimiento: validarFechaNacimiento(v.fechaNacimiento),
  password: validarPassword(v.password),
  confirmPassword: validarConfirmPassword(v.password, v.confirmPassword),
});

export const validarFormularioUsuarioEditar = (v) => ({
  nombre: validarNombre(v.nombre),
  correo: validarCorreo(v.correo),
  fechaNacimiento: validarFechaNacimiento(v.fechaNacimiento),
});

export const validarFormularioProducto = (v) => ({
  nombre: validarNombreProducto(v.nombre),
  precio: validarPrecio(v.precio),
  descripcion: validarDescripcion(v.descripcion),
});

export const tieneErrores = (errores) => Object.values(errores).some(Boolean);
