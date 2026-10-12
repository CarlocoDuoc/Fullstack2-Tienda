import { Router } from "express";
import { consultar } from "../db.js";
import { autenticado, soloAdmin } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/errores.js";
import { soloErrores, texto, validarImagen, validarNombre } from "../utils/validaciones.js";

const router = Router();

const SELECT = `
  SELECT c.id, c.nombre, c.descripcion, c.imagen,
         (SELECT COUNT(*)::int FROM productos p WHERE p.categoria_id = c.id) AS "totalProductos"
    FROM categorias c`;

function validar(body) {
  const { nombre, descripcion, imagen } = body ?? {};
  return soloErrores({
    nombre: validarNombre(nombre, "El nombre de la categoría", 60),
    descripcion: texto(descripcion).length > 200 ? "La descripción no puede superar los 200 caracteres." : "",
    imagen: validarImagen(imagen),
  });
}

const idValido = (valor) => {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "Identificador no válido.");
  return id;
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json((await consultar(`${SELECT} ORDER BY c.nombre`)).rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const fila = (await consultar(`${SELECT} WHERE c.id = $1`, [idValido(req.params.id)])).rows[0];
    if (!fila) throw new ApiError(404, "Categoría no encontrada.");
    res.json(fila);
  })
);

router.post(
  "/",
  autenticado,
  soloAdmin,
  asyncHandler(async (req, res) => {
    const errores = validar(req.body);
    if (errores) throw new ApiError(400, "Revisa los campos del formulario.", errores);
    const { nombre, descripcion, imagen } = req.body;
    const { rows } = await consultar(
      "INSERT INTO categorias (nombre, descripcion, imagen) VALUES ($1, $2, $3) RETURNING id",
      [texto(nombre), texto(descripcion), imagen ?? ""]
    );
    res.status(201).json((await consultar(`${SELECT} WHERE c.id = $1`, [rows[0].id])).rows[0]);
  })
);

router.put(
  "/:id",
  autenticado,
  soloAdmin,
  asyncHandler(async (req, res) => {
    const id = idValido(req.params.id);
    const errores = validar(req.body);
    if (errores) throw new ApiError(400, "Revisa los campos del formulario.", errores);
    const { nombre, descripcion, imagen } = req.body;
    const { rowCount } = await consultar(
      "UPDATE categorias SET nombre = $1, descripcion = $2, imagen = $3 WHERE id = $4",
      [texto(nombre), texto(descripcion), imagen ?? "", id]
    );
    if (!rowCount) throw new ApiError(404, "Categoría no encontrada.");
    res.json((await consultar(`${SELECT} WHERE c.id = $1`, [id])).rows[0]);
  })
);

// Los productos de la categoría eliminada quedan "sin categoría" (ON DELETE SET NULL)
router.delete(
  "/:id",
  autenticado,
  soloAdmin,
  asyncHandler(async (req, res) => {
    const { rowCount } = await consultar("DELETE FROM categorias WHERE id = $1", [idValido(req.params.id)]);
    if (!rowCount) throw new ApiError(404, "Categoría no encontrada.");
    res.status(204).end();
  })
);

export default router;
