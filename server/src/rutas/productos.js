import { Router } from "express";
import { consultar } from "../db.js";
import { autenticado, soloAdmin } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/errores.js";
import { SELECT_PRODUCTO, aProducto } from "../utils/mapeos.js";
import {
  soloErrores,
  texto,
  validarEnteroNoNegativo,
  validarFicha,
  validarImagen,
  validarNombre,
  validarPrecio,
} from "../utils/validaciones.js";

const router = Router();

const idValido = (valor) => {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "Identificador no válido.");
  return id;
};

const sinOferta = (valor) => valor === null || valor === undefined || valor === "";

function validar(body) {
  const b = body ?? {};
  const errores = soloErrores({
    nombre: validarNombre(b.nombre, "El nombre del producto", 100),
    descripcion: !texto(b.descripcion)
      ? "La descripción es obligatoria."
      : texto(b.descripcion).length > 300
        ? "La descripción no puede superar los 300 caracteres."
        : "",
    precio: validarPrecio(b.precio),
    precioOferta: validarPrecio(b.precioOferta, { opcional: true }),
    stock: validarEnteroNoNegativo(b.stock ?? 0, "El stock"),
    stockCritico: validarEnteroNoNegativo(b.stockCritico ?? 5, "El stock crítico"),
    imagen: validarImagen(b.imagen),
    ficha: validarFicha(b.ficha),
  });
  if (errores) return errores;
  if (!sinOferta(b.precioOferta) && Number(b.precioOferta) >= Number(b.precio)) {
    return { precioOferta: "El precio de oferta debe ser menor al precio normal." };
  }
  return null;
}

async function validarCategoria(categoriaId) {
  if (categoriaId === null || categoriaId === undefined || categoriaId === "") return null;
  const id = Number(categoriaId);
  if (!Number.isInteger(id)) throw new ApiError(400, "Revisa los campos del formulario.", { categoriaId: "La categoría no es válida." });
  const existe = (await consultar("SELECT 1 FROM categorias WHERE id = $1", [id])).rowCount;
  if (!existe) throw new ApiError(400, "Revisa los campos del formulario.", { categoriaId: "La categoría no existe." });
  return id;
}

const valoresProducto = (b, categoriaId) => [
  texto(b.nombre),
  texto(b.descripcion),
  Number(b.precio),
  sinOferta(b.precioOferta) ? null : Number(b.precioOferta),
  b.imagen ?? "",
  Boolean(b.destacado),
  Number(b.stock ?? 0),
  Number(b.stockCritico ?? 5),
  categoriaId,
  JSON.stringify(b.ficha ?? []),
];

// GET /api/productos?q=&categoria=&oferta=true&destacado=true
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const condiciones = [];
    const params = [];
    const { q, categoria, oferta, destacado } = req.query;

    if (typeof q === "string" && q.trim()) {
      params.push(`%${q.trim()}%`);
      condiciones.push(`(p.nombre ILIKE $${params.length} OR p.descripcion ILIKE $${params.length})`);
    }
    if (categoria !== undefined) {
      const id = Number(categoria);
      if (!Number.isInteger(id)) throw new ApiError(400, "Categoría no válida.");
      params.push(id);
      condiciones.push(`p.categoria_id = $${params.length}`);
    }
    if (oferta === "true") condiciones.push("p.precio_oferta IS NOT NULL");
    if (destacado === "true") condiciones.push("p.destacado = TRUE");

    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
    const { rows } = await consultar(`${SELECT_PRODUCTO} ${where} ORDER BY p.id`, params);
    res.json(rows.map(aProducto));
  })
);

// GET /api/productos/criticos  (solo admin) — stock igual o menor al umbral crítico
router.get(
  "/criticos",
  autenticado,
  soloAdmin,
  asyncHandler(async (req, res) => {
    const { rows } = await consultar(`${SELECT_PRODUCTO} WHERE p.stock <= p.stock_critico ORDER BY p.stock, p.id`);
    res.json(rows.map(aProducto));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const fila = (await consultar(`${SELECT_PRODUCTO} WHERE p.id = $1`, [idValido(req.params.id)])).rows[0];
    if (!fila) throw new ApiError(404, "Producto no encontrado.");
    res.json(aProducto(fila));
  })
);

router.post(
  "/",
  autenticado,
  soloAdmin,
  asyncHandler(async (req, res) => {
    const errores = validar(req.body);
    if (errores) throw new ApiError(400, "Revisa los campos del formulario.", errores);
    const categoriaId = await validarCategoria(req.body.categoriaId);
    const { rows } = await consultar(
      `INSERT INTO productos
         (nombre, descripcion, precio, precio_oferta, imagen, destacado, stock, stock_critico, categoria_id, ficha)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
       RETURNING id`,
      valoresProducto(req.body, categoriaId)
    );
    const fila = (await consultar(`${SELECT_PRODUCTO} WHERE p.id = $1`, [rows[0].id])).rows[0];
    res.status(201).json(aProducto(fila));
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
    const categoriaId = await validarCategoria(req.body.categoriaId);
    const { rowCount } = await consultar(
      `UPDATE productos
          SET nombre = $1, descripcion = $2, precio = $3, precio_oferta = $4, imagen = $5,
              destacado = $6, stock = $7, stock_critico = $8, categoria_id = $9, ficha = $10::jsonb
        WHERE id = $11`,
      [...valoresProducto(req.body, categoriaId), id]
    );
    if (!rowCount) throw new ApiError(404, "Producto no encontrado.");
    const fila = (await consultar(`${SELECT_PRODUCTO} WHERE p.id = $1`, [id])).rows[0];
    res.json(aProducto(fila));
  })
);

router.delete(
  "/:id",
  autenticado,
  soloAdmin,
  asyncHandler(async (req, res) => {
    const { rowCount } = await consultar("DELETE FROM productos WHERE id = $1", [idValido(req.params.id)]);
    if (!rowCount) throw new ApiError(404, "Producto no encontrado.");
    res.status(204).end();
  })
);

export default router;
