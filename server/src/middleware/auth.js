import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { consultar } from "../db.js";
import { ApiError, asyncHandler } from "../utils/errores.js";

export const firmarToken = (usuario) =>
  jwt.sign({ sub: usuario.id, rol: usuario.rol }, config.jwtSecret, { expiresIn: config.jwtExpira });

async function usuarioDesdeToken(req) {
  const cabecera = req.headers.authorization || "";
  if (!cabecera.startsWith("Bearer ")) return null;
  let payload;
  try {
    payload = jwt.verify(cabecera.slice(7), config.jwtSecret);
  } catch {
    throw new ApiError(401, "Tu sesión expiró. Vuelve a iniciar sesión.");
  }
  // Se consulta la base en cada petición: si borran o desactivan al usuario, pierde el acceso al instante.
  const { rows } = await consultar("SELECT id, nombre, usuario, rol, estado FROM usuarios WHERE id = $1", [payload.sub]);
  const usuario = rows[0];
  if (!usuario || usuario.estado !== "Activo") throw new ApiError(401, "Tu cuenta no está disponible.");
  return usuario;
}

// Exige sesión iniciada
export const autenticado = asyncHandler(async (req, res, next) => {
  const usuario = await usuarioDesdeToken(req);
  if (!usuario) throw new ApiError(401, "Debes iniciar sesión.");
  req.usuario = usuario;
  next();
});

// La sesión es opcional (por ejemplo, para comprar como invitado)
export const sesionOpcional = asyncHandler(async (req, res, next) => {
  req.usuario = (await usuarioDesdeToken(req)) || null;
  next();
});

// Exige rol Administrador (debe usarse después de `autenticado`)
export const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== "Administrador") return next(new ApiError(403, "No tienes permisos para esta acción."));
  next();
};
