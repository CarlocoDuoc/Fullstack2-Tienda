import bcrypt from "bcryptjs";
import { Router } from "express";
import { config } from "../config.js";
import { consultar } from "../db.js";
import { autenticado, firmarToken } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/errores.js";
import { candidatoUsuario, usuarioBaseDesdeCorreo, verificarTokenGoogle } from "../utils/google.js";
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
    const coincide = fila?.password_hash ? await bcrypt.compare(password, fila.password_hash) : false;
    if (!coincide) throw new ApiError(401, "Usuario o contraseña incorrectos. Verifica tus datos.");
    if (fila.estado !== "Activo") throw new ApiError(403, "Tu cuenta está inactiva. Contacta a un administrador.");

    res.json({ token: firmarToken(fila), usuario: await obtenerUsuario(fila.id) });
  })
);

// POST /api/auth/google  { credential }  (ID token entregado por el botón de Google)
// Si la cuenta de Google ya está vinculada inicia sesión; si no, crea un Cliente nuevo.
router.post(
  "/google",
  asyncHandler(async (req, res) => {
    const { credential } = req.body ?? {};
    if (typeof credential !== "string" || !credential) throw new ApiError(400, "Falta la credencial de Google.");
    if (!config.googleClientId) throw new ApiError(503, "El inicio de sesión con Google no está configurado en el servidor.");

    let google;
    try {
      google = await verificarTokenGoogle(credential, config.googleClientId);
    } catch {
      throw new ApiError(401, "No se pudo verificar tu cuenta de Google. Inténtalo de nuevo.");
    }
    if (!google.email || !google.emailVerificado) throw new ApiError(401, "Tu correo de Google no está verificado.");

    // 1) ¿ya entró antes con esta cuenta de Google?
    let fila = (await consultar("SELECT id, estado, rol FROM usuarios WHERE google_id = $1", [google.sub])).rows[0];

    // 2) ¿existe una cuenta con ese correo (verificado por Google)? Se vincula.
    if (!fila) {
      fila = (await consultar("SELECT id, estado, rol FROM usuarios WHERE LOWER(correo) = LOWER($1)", [google.email])).rows[0];
      if (fila) await consultar("UPDATE usuarios SET google_id = $1 WHERE id = $2", [google.sub, fila.id]);
    }

    // 3) Cuenta nueva: siempre rol Cliente, usuario generado desde el correo
    if (!fila) {
      const base = usuarioBaseDesdeCorreo(google.email);
      const nombre = texto(google.nombre || base).slice(0, 50);
      const apellidos = texto(google.apellidos).slice(0, 50);
      for (let intento = 0; intento < 20 && !fila; intento += 1) {
        const { rows } = await consultar(
          `INSERT INTO usuarios (nombre, apellidos, usuario, correo, google_id, rol, estado)
           VALUES ($1, $2, $3, $4, $5, 'Cliente', 'Activo')
           ON CONFLICT DO NOTHING
           RETURNING id, estado, rol`,
          [nombre, apellidos, candidatoUsuario(base, intento), google.email.slice(0, 100), google.sub]
        );
        fila = rows[0];
      }
      if (!fila) throw new ApiError(409, "No se pudo crear tu cuenta. Inténtalo de nuevo.");
    }

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
      const hashActual = rows[0].password_hash;
      // Las cuentas creadas con Google no tienen contraseña: pueden definir una sin indicar la actual.
      const correcta = hashActual ? await bcrypt.compare(passwordActual ?? "", hashActual) : true;
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
