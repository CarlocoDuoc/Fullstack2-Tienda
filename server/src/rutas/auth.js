import bcrypt from "bcryptjs";
import { Router } from "express";
import { consultar } from "../db.js";
import { autenticado, firmarToken } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/errores.js";
import { COLUMNAS_USUARIO } from "../utils/mapeos.js";
import {
  soloErrores,
  texto,
  validarUsuario,
  validarFechaNacimiento,
  validarNombre,
  validarPassword,
} from "../utils/validaciones.js";

const router = Router();

const obtenerUsuario = async (id) => (await consultar(`SELECT ${COLUMNAS_USUARIO} FROM usuarios WHERE id = $1`, [id])).rows[0];

// POST /api/auth/registro  (público: siempre crea un Cliente)
router.post(
  "/registro",
  asyncHandler(async (req, res) => {
    const { nombre, usuario, fechaNacimiento, password } = req.body ?? {};
    const errores = soloErrores({
      nombre: validarNombre(nombre),
      usuario: validarUsuario(usuario),
      fechaNacimiento: validarFechaNacimiento(fechaNacimiento),
      password: validarPassword(password),
    });
    if (errores) throw new ApiError(400, "Revisa los campos del formulario.", errores);

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await consultar(
      `INSERT INTO usuarios (nombre, usuario, password_hash, fecha_nacimiento, rol, estado)
       VALUES ($1, $2, $3, $4, 'Cliente', 'Activo')
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [texto(nombre), texto(usuario), hash, fechaNacimiento]
    );
    if (!rows[0]) throw new ApiError(409, "Ese nombre de usuario ya está ocupado.", { usuario: "Ese nombre de usuario ya está ocupado." });
    res.status(201).json({ usuario: await obtenerUsuario(rows[0].id) });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { usuario, password } = req.body ?? {};
    if (typeof usuario !== "string" || typeof password !== "string") {
      throw new ApiError(400, "Ingresa tu usuario y contraseña.");
    }
    const { rows } = await consultar("SELECT id, password_hash, estado, rol FROM usuarios WHERE LOWER(usuario) = LOWER($1)", [
      texto(usuario),
    ]);
    const fila = rows[0];
    // Mismo mensaje si el usuario no existe o la clave es incorrecta (no revela qué usuarios existen)
    const coincide = fila ? await bcrypt.compare(password, fila.password_hash) : false;
    if (!coincide) throw new ApiError(401, "Usuario o contraseña incorrectos. Verifica tus datos.");
    if (fila.estado !== "Activo") throw new ApiError(403, "Tu cuenta está inactiva. Contacta a un administrador.");

    res.json({ token: firmarToken(fila), usuario: await obtenerUsuario(fila.id) });
  })
);

// GET /api/auth/me
router.get(
  "/me",
  autenticado,
  asyncHandler(async (req, res) => {
    res.json({ usuario: await obtenerUsuario(req.usuario.id) });
  })
);

// PUT /api/auth/perfil  (datos personales, dirección y, opcionalmente, cambio de contraseña)
router.put(
  "/perfil",
  autenticado,
  asyncHandler(async (req, res) => {
    const { nombre, apellidos, fechaNacimiento, calle, departamento, region, comuna, passwordActual, passwordNueva } =
      req.body ?? {};

    const errores = soloErrores({
      nombre: validarNombre(nombre),
      apellidos: texto(apellidos).length > 50 ? "Los apellidos no pueden superar los 50 caracteres." : "",
      fechaNacimiento: validarFechaNacimiento(fechaNacimiento),
      calle: texto(calle).length > 120 ? "La calle no puede superar los 120 caracteres." : "",
      departamento: texto(departamento).length > 30 ? "El departamento no puede superar los 30 caracteres." : "",
      region: texto(region).length > 80 ? "La región no es válida." : "",
      comuna: texto(comuna).length > 80 ? "La comuna no es válida." : "",
      ...(passwordNueva ? { passwordNueva: validarPassword(passwordNueva) } : {}),
    });
    if (errores) throw new ApiError(400, "Revisa los campos del formulario.", errores);

    if (passwordNueva) {
      const { rows } = await consultar("SELECT password_hash FROM usuarios WHERE id = $1", [req.usuario.id]);
      const correcta = await bcrypt.compare(passwordActual ?? "", rows[0].password_hash);
      if (!correcta) {
        throw new ApiError(400, "La contraseña actual no es correcta.", { passwordActual: "La contraseña actual no es correcta." });
      }
      await consultar("UPDATE usuarios SET password_hash = $1 WHERE id = $2", [await bcrypt.hash(passwordNueva, 10), req.usuario.id]);
    }

    await consultar(
      `UPDATE usuarios
          SET nombre = $1, apellidos = $2, fecha_nacimiento = $3,
              calle = $4, departamento = $5, region = $6, comuna = $7
        WHERE id = $8`,
      [texto(nombre), texto(apellidos), fechaNacimiento, texto(calle), texto(departamento), texto(region), texto(comuna), req.usuario.id]
    );
    res.json({ usuario: await obtenerUsuario(req.usuario.id) });
  })
);

export default router;
