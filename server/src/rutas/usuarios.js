import bcrypt from "bcryptjs";
import { Router } from "express";
import { consultar } from "../db.js";
import { autenticado, soloAdmin } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/errores.js";
import { COLUMNAS_USUARIO, aOrden } from "../utils/mapeos.js";
import {
  soloErrores,
  texto,
  validarUsuario,
  validarFechaNacimiento,
  validarNombre,
  validarPassword,
} from "../utils/validaciones.js";

const router = Router();
router.use(autenticado, soloAdmin);

const ROLES = ["Cliente", "Administrador"];
const ESTADOS = ["Activo", "Inactivo"];

const idValido = (valor) => {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "Identificador no válido.");
  return id;
};

const obtener = async (id) => (await consultar(`SELECT ${COLUMNAS_USUARIO} FROM usuarios WHERE id = $1`, [id])).rows[0];

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json((await consultar(`SELECT ${COLUMNAS_USUARIO} FROM usuarios ORDER BY id`)).rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const usuario = await obtener(idValido(req.params.id));
    if (!usuario) throw new ApiError(404, "Usuario no encontrado.");
    res.json(usuario);
  })
);

// Historial de compras de un usuario
router.get(
  "/:id/ordenes",
  asyncHandler(async (req, res) => {
    const id = idValido(req.params.id);
    if (!(await obtener(id))) throw new ApiError(404, "Usuario no encontrado.");
    const { rows } = await consultar(
      `SELECT o.*, (SELECT COALESCE(SUM(i.cantidad), 0)::int FROM orden_items i WHERE i.orden_id = o.id) AS unidades
         FROM ordenes o WHERE o.usuario_id = $1 ORDER BY o.creado_en DESC`,
      [id]
    );
    res.json(rows.map((fila) => ({ ...aOrden(fila), unidades: Number(fila.unidades) })));
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { nombre, usuario, fechaNacimiento, password, rol = "Cliente", estado = "Activo" } = req.body ?? {};
    const errores = soloErrores({
      nombre: validarNombre(nombre),
      usuario: validarUsuario(usuario),
      fechaNacimiento: validarFechaNacimiento(fechaNacimiento),
      password: validarPassword(password),
      rol: ROLES.includes(rol) ? "" : "El rol no es válido.",
      estado: ESTADOS.includes(estado) ? "" : "El estado no es válido.",
    });
    if (errores) throw new ApiError(400, "Revisa los campos del formulario.", errores);

    const { rows } = await consultar(
      `INSERT INTO usuarios (nombre, usuario, password_hash, fecha_nacimiento, rol, estado)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [texto(nombre), texto(usuario), await bcrypt.hash(password, 10), fechaNacimiento, rol, estado]
    );
    if (!rows[0]) throw new ApiError(409, "Ese nombre de usuario ya está ocupado.", { usuario: "Ese nombre de usuario ya está ocupado." });
    res.status(201).json(await obtener(rows[0].id));
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idValido(req.params.id);
    const { nombre, usuario, fechaNacimiento, rol, estado } = req.body ?? {};
    const actual = await obtener(id);
    if (!actual) throw new ApiError(404, "Usuario no encontrado.");

    const errores = soloErrores({
      nombre: validarNombre(nombre),
      usuario: validarUsuario(usuario),
      fechaNacimiento: validarFechaNacimiento(fechaNacimiento),
      rol: ROLES.includes(rol) ? "" : "El rol no es válido.",
      estado: ESTADOS.includes(estado) ? "" : "El estado no es válido.",
    });
    if (errores) throw new ApiError(400, "Revisa los campos del formulario.", errores);
    if (id === req.usuario.id && (rol !== actual.rol || estado !== actual.estado)) {
      throw new ApiError(400, "No puedes cambiar tu propio rol ni tu estado.");
    }

    const duplicado = await consultar("SELECT 1 FROM usuarios WHERE LOWER(usuario) = LOWER($1) AND id <> $2", [texto(usuario), id]);
    if (duplicado.rowCount) {
      throw new ApiError(409, "Ese nombre de usuario ya está ocupado.", { usuario: "Ese nombre de usuario ya está ocupado." });
    }

    await consultar(
      "UPDATE usuarios SET nombre = $1, usuario = $2, fecha_nacimiento = $3, rol = $4, estado = $5 WHERE id = $6",
      [texto(nombre), texto(usuario), fechaNacimiento, rol, estado, id]
    );
    res.json(await obtener(id));
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idValido(req.params.id);
    if (id === req.usuario.id) throw new ApiError(400, "No puedes eliminar tu propia cuenta.");
    const { rowCount } = await consultar("DELETE FROM usuarios WHERE id = $1", [id]);
    if (!rowCount) throw new ApiError(404, "Usuario no encontrado.");
    res.status(204).end();
  })
);

export default router;
