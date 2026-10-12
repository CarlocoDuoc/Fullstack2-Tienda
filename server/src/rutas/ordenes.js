import { Router } from "express";
import { consultar, transaccion } from "../db.js";
import { autenticado, soloAdmin } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/errores.js";
import { aOrden } from "../utils/mapeos.js";
import { generarCodigoOrden } from "../utils/codigoOrden.js";
import { armarLineas, prepararOrden } from "../utils/ordenes.js";

const router = Router();

const SELECT_LISTA = `
  SELECT o.*, (SELECT COALESCE(SUM(i.cantidad), 0)::int FROM orden_items i WHERE i.orden_id = o.id) AS unidades
    FROM ordenes o`;

const aLista = (fila) => ({ ...aOrden(fila), unidades: Number(fila.unidades) });

// POST /api/ordenes — procesa la compra (con pago simulado). Exige sesión iniciada: no hay compras de invitados.
router.post(
  "/",
  autenticado,
  asyncHandler(async (req, res) => {
    const datos = prepararOrden(req.body);

    const orden = await transaccion(async (cliente) => {
      // Bloquea las filas de los productos para que dos compras simultáneas no vendan el mismo stock
      const ids = datos.items.map((i) => i.productoId).sort((a, b) => a - b);
      const { rows: productos } = await cliente.query(
        `SELECT id, nombre, imagen, stock, COALESCE(precio_oferta, precio) AS precio_final
           FROM productos WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE`,
        [ids]
      );
      const { lineas, total } = armarLineas(datos.items, productos);
      const estado = datos.pagoAprobado ? "Pagada" : "Pago fallido";
      const { cliente: c, direccion: d } = datos;

      let filaOrden = null;
      for (let intento = 0; intento < 5 && !filaOrden; intento++) {
        const resultado = await cliente.query(
          `INSERT INTO ordenes
             (codigo, usuario_id, nombre, apellidos, correo, calle, departamento, region, comuna, indicaciones, total, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (codigo) DO NOTHING
           RETURNING *`,
          [generarCodigoOrden(), req.usuario.id, c.nombre, c.apellidos, c.correo, d.calle, d.departamento, d.region, d.comuna, d.indicaciones, total, estado]
        );
        filaOrden = resultado.rows[0] ?? null;
      }
      if (!filaOrden) throw new ApiError(500, "No se pudo generar el código de la orden. Intenta nuevamente.");

      const filasItems = [];
      for (const l of lineas) {
        const { rows } = await cliente.query(
          `INSERT INTO orden_items (orden_id, producto_id, nombre, imagen, precio_unitario, cantidad)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [filaOrden.id, l.productoId, l.nombre, l.imagen, l.precioUnitario, l.cantidad]
        );
        filasItems.push(rows[0]);
        // El stock solo se descuenta si el pago fue aprobado
        if (datos.pagoAprobado) {
          await cliente.query("UPDATE productos SET stock = stock - $1 WHERE id = $2", [l.cantidad, l.productoId]);
        }
      }

      if (datos.guardarDatos) {
        await cliente.query(
          "UPDATE usuarios SET apellidos = $1, calle = $2, departamento = $3, region = $4, comuna = $5 WHERE id = $6",
          [c.apellidos, d.calle, d.departamento, d.region, d.comuna, req.usuario.id]
        );
      }
      return aOrden(filaOrden, filasItems);
    });

    res.status(201).json(orden);
  })
);

// GET /api/ordenes/mias — historial del usuario con sesión
router.get(
  "/mias",
  autenticado,
  asyncHandler(async (req, res) => {
    const { rows } = await consultar(`${SELECT_LISTA} WHERE o.usuario_id = $1 ORDER BY o.creado_en DESC`, [req.usuario.id]);
    res.json(rows.map(aLista));
  })
);

// GET /api/ordenes — todas las órdenes (admin). ?estado=Pagada | Pago fallido
router.get(
  "/",
  autenticado,
  soloAdmin,
  asyncHandler(async (req, res) => {
    const { estado } = req.query;
    if (estado !== undefined && !["Pagada", "Pago fallido"].includes(estado)) throw new ApiError(400, "Estado no válido.");
    const { rows } = estado
      ? await consultar(`${SELECT_LISTA} WHERE o.estado = $1 ORDER BY o.creado_en DESC`, [estado])
      : await consultar(`${SELECT_LISTA} ORDER BY o.creado_en DESC`);
    res.json(rows.map(aLista));
  })
);

// GET /api/ordenes/:id — boleta completa (dueño o admin)
router.get(
  "/:id",
  autenticado,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "Identificador no válido.");
    const fila = (await consultar("SELECT * FROM ordenes WHERE id = $1", [id])).rows[0];
    const esDueno = fila && fila.usuario_id === req.usuario.id;
    // Si no es suyo, responde 404 (no revela que la orden existe)
    if (!fila || (!esDueno && req.usuario.rol !== "Administrador")) throw new ApiError(404, "Orden no encontrada.");
    const { rows: items } = await consultar("SELECT * FROM orden_items WHERE orden_id = $1 ORDER BY id", [id]);
    res.json(aOrden(fila, items));
  })
);

export default router;
