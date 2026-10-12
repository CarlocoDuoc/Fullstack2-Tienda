// Reglas de validación del proyecto. Cada validador recibe un valor y devuelve
// un mensaje de error, o "" cuando el valor es correcto. El servidor repite las mismas reglas.

export const EDAD_MINIMA = 18;
export const TAMANO_MAX_IMAGEN = 512 * 1024; // 512 KB (se guarda dentro de la base de datos)
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const t = (v) => String(v ?? "").trim();

export function calcularEdad(fechaIso, hoy = new Date()) {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  let edad = hoy.getFullYear() - anio;
  const diferenciaMes = hoy.getMonth() + 1 - mes;
  if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < dia)) edad--;
  return edad;
}

export function validarNombre(valor, etiqueta = "El nombre", max = 50) {
  const texto = t(valor);
  if (!texto) return `${etiqueta} es obligatorio.`;
  if (texto.length > max) return `${etiqueta} no puede superar los ${max} caracteres.`;
  return "";
}

// Correo con formato válido (solo para el contacto y la compra; el acceso a la cuenta es con usuario).
export function validarCorreo(valor) {
  const texto = t(valor);
  if (!texto) return "El correo electrónico es obligatorio.";
  if (texto.length > 100) return "El correo no debe superar los 100 caracteres.";
  if (!FORMATO_CORREO.test(texto)) return "El correo no tiene un formato válido.";
  return "";
}

// Se mantiene por compatibilidad: ahora es idéntico a validarCorreo.
export const validarCorreoGeneral = validarCorreo;

// Nombre de usuario para iniciar sesión (no es un correo): 3 a 30 caracteres, sin espacios.
export function validarUsuario(valor) {
  const texto = t(valor);
  if (!texto) return "El usuario es obligatorio.";
  if (texto.length < 3 || texto.length > 30) return "El usuario debe tener entre 3 y 30 caracteres.";
  if (!/^[A-Za-z0-9._-]+$/.test(texto)) return "Solo se permiten letras, números, punto, guion y guion bajo (sin espacios).";
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
  return validarNombre(valor, "El nombre del producto", 100);
}

export function validarPrecio(valor) {
  if (valor === "" || valor === null || valor === undefined) return "El precio es obligatorio.";
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) return "El precio debe ser un número mayor a 0.";
  if (!Number.isInteger(numero)) return "El precio debe ser un número entero (pesos chilenos).";
  if (numero > 100000000) return "El precio es demasiado alto.";
  return "";
}

// El precio de oferta es opcional; si se ingresa debe ser menor al precio normal.
export function validarPrecioOferta(oferta, precio) {
  if (oferta === "" || oferta === null || oferta === undefined) return "";
  const error = validarPrecio(oferta);
  if (error) return error;
  if (Number(precio) > 0 && Number(oferta) >= Number(precio)) return "La oferta debe ser menor al precio normal.";
  return "";
}

export function validarEntero(valor, etiqueta) {
  if (valor === "" || valor === null || valor === undefined) return `${etiqueta} es obligatorio.`;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 0) return `${etiqueta} debe ser un entero igual o mayor a 0.`;
  if (numero > 100000) return `${etiqueta} es demasiado alto.`;
  return "";
}

export function validarDescripcion(valor) {
  const texto = t(valor);
  if (!texto) return "La descripción es obligatoria.";
  if (texto.length > 300) return "La descripción no puede superar los 300 caracteres.";
  return "";
}

export function validarImagen(archivo) {
  if (!archivo.type.startsWith("image/")) return "El archivo debe ser una imagen.";
  if (archivo.size > TAMANO_MAX_IMAGEN) return "La imagen no puede pesar más de 512 KB.";
  return "";
}

const obligatorio = (valor, etiqueta, max) => {
  const texto = t(valor);
  if (!texto) return `${etiqueta} es obligatoria.`;
  if (texto.length > max) return `${etiqueta} no puede superar los ${max} caracteres.`;
  return "";
};

// --- Validadores por formulario: devuelven { campo: mensaje } ---

// El acceso es con usuario y contraseña: solo se exige que no estén vacíos.
export const validarFormularioLogin = (v) => ({
  usuario: t(v.usuario) ? "" : "Ingresa tu usuario.",
  password: v.password ? "" : "Ingresa tu contraseña.",
});

export const validarFormularioRegistro = (v) => ({
  nombre: validarNombre(v.nombre),
  usuario: validarUsuario(v.usuario),
  fechaNacimiento: validarFechaNacimiento(v.fechaNacimiento),
  password: validarPassword(v.password),
  confirmPassword: validarConfirmPassword(v.password, v.confirmPassword),
  terminos: validarTerminos(v.terminos),
});

export const validarFormularioUsuarioNuevo = (v) => ({
  nombre: validarNombre(v.nombre),
  usuario: validarUsuario(v.usuario),
  fechaNacimiento: validarFechaNacimiento(v.fechaNacimiento),
  password: validarPassword(v.password),
  confirmPassword: validarConfirmPassword(v.password, v.confirmPassword),
});

export const validarFormularioUsuarioEditar = (v) => ({
  nombre: validarNombre(v.nombre),
  usuario: validarUsuario(v.usuario),
  fechaNacimiento: validarFechaNacimiento(v.fechaNacimiento),
});

export const validarFormularioProducto = (v) => ({
  nombre: validarNombreProducto(v.nombre),
  precio: validarPrecio(v.precio),
  precioOferta: validarPrecioOferta(v.precioOferta, v.precio),
  stock: validarEntero(v.stock, "El stock"),
  stockCritico: validarEntero(v.stockCritico, "El stock crítico"),
  descripcion: validarDescripcion(v.descripcion),
});

export const validarFormularioCategoria = (v) => ({
  nombre: validarNombre(v.nombre, "El nombre de la categoría", 60),
  descripcion: t(v.descripcion).length > 200 ? "La descripción no puede superar los 200 caracteres." : "",
});

export const validarFormularioCheckout = (v) => ({
  nombre: validarNombre(v.nombre),
  apellidos: validarNombre(v.apellidos, "Los apellidos"),
  correo: validarCorreoGeneral(v.correo),
  calle: obligatorio(v.calle, "La calle", 120),
  departamento: t(v.departamento).length > 30 ? "El departamento no puede superar los 30 caracteres." : "",
  region: t(v.region) ? "" : "Selecciona una región.",
  comuna: t(v.comuna) ? "" : "Selecciona una comuna.",
  indicaciones: t(v.indicaciones).length > 300 ? "Las indicaciones no pueden superar los 300 caracteres." : "",
});

export const validarFormularioContacto = (v) => ({
  nombre: validarNombre(v.nombre),
  correo: validarCorreoGeneral(v.correo),
  asunto: obligatorio(v.asunto, "El asunto", 100),
  mensaje: obligatorio(v.mensaje, "El mensaje", 1000),
});

export const validarFormularioPerfil = (v) => ({
  nombre: validarNombre(v.nombre),
  apellidos: t(v.apellidos).length > 50 ? "Los apellidos no pueden superar los 50 caracteres." : "",
  fechaNacimiento: validarFechaNacimiento(v.fechaNacimiento),
  calle: t(v.calle).length > 120 ? "La calle no puede superar los 120 caracteres." : "",
  departamento: t(v.departamento).length > 30 ? "El departamento no puede superar los 30 caracteres." : "",
  passwordNueva: v.passwordNueva ? validarPassword(v.passwordNueva) : "",
  passwordActual: v.passwordNueva && !v.passwordActual ? "Ingresa tu contraseña actual." : "",
});

export const tieneErrores = (errores) => Object.values(errores).some(Boolean);
