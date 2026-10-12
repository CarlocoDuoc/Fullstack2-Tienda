import { Router } from "express";
import { consultar } from "../db.js";
import { autenticado, soloAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/errores.js";

const router = Router();
router.use(autenticado, soloAdmin);

// Tarjetas del dashboard
router.get(
  "/resumen",
  asyncHandler(async (req, res) => {
    const { rows } = await consultar(`
      SELECT
        (SELECT COUNT(*)::int FROM productos)  AS productos,
        (SELECT COUNT(*)::int FROM categorias) AS categorias,
        (SELECT COUNT(*)::int FROM usuarios)   AS usuarios,
        (SELECT COUNT(*)::int FROM ordenes WHERE estado = 'Pagada')       AS "ordenesPagadas",
        (SELECT COUNT(*)::int FROM ordenes WHERE estado = 'Pago fallido') AS "ordenesFallidas",
        (SELECT COALESCE(SUM(total), 0)::int FROM ordenes WHERE estado = 'Pagada') AS ingresos,
        (SELECT COUNT(*)::int FROM productos WHERE stock <= stock_critico) AS "productosCriticos",
        (SELECT COUNT(*)::int FROM mensajes_contacto) AS mensajes`);
    res.json(rows[0]);
  })
);

// Reportes de ventas (solo órdenes pagadas)
router.get(
  "/reportes",
  asyncHandler(async (req, res) => {
    const [resumen, porDia, top, porCategoria] = await Promise.all([
      consultar(`SELECT COALESCE(SUM(total), 0)::int AS ingresos, COUNT(*)::int AS ordenes
                   FROM ordenes WHERE estado = 'Pagada'`),
      consultar(`SELECT to_char(d::date, 'YYYY-MM-DD') AS fecha,
                        COALESCE(SUM(o.total), 0)::int AS total,
                        COUNT(o.id)::int AS ordenes
                   FROM generate_series(current_date - 13, current_date, interval '1 day') AS d
                   LEFT JOIN ordenes o ON o.creado_en::date = d::date AND o.estado = 'Pagada'
                  GROUP BY d ORDER BY d`),
      consultar(`SELECT i.nombre, SUM(i.cantidad)::int AS unidades, SUM(i.cantidad * i.precio_unitario)::int AS ingresos
                   FROM orden_items i JOIN ordenes o ON o.id = i.orden_id
                  WHERE o.estado = 'Pagada'
                  GROUP BY i.nombre ORDER BY unidades DESC, ingresos DESC LIMIT 5`),
      consultar(`SELECT COALESCE(c.nombre, 'Sin categoría') AS categoria,
                        SUM(i.cantidad * i.precio_unitario)::int AS ingresos
                   FROM orden_items i
                   JOIN ordenes o ON o.id = i.orden_id
                   LEFT JOIN productos p ON p.id = i.producto_id
                   LEFT JOIN categorias c ON c.id = p.categoria_id
                  WHERE o.estado = 'Pagada'
                  GROUP BY COALESCE(c.nombre, 'Sin categoría') ORDER BY ingresos DESC`),
    ]);
    const { ingresos, ordenes } = resumen.rows[0];
    res.json({
      resumen: { ingresos, ordenes, ticketPromedio: ordenes ? Math.round(ingresos / ordenes) : 0 },
      ventasPorDia: porDia.rows,
      topProductos: top.rows,
      ventasPorCategoria: porCategoria.rows,
    });
  })
);

// Mensajes recibidos por el formulario de contacto
router.get(
  "/mensajes",
  asyncHandler(async (req, res) => {
    const { rows } = await consultar(
      "SELECT id, nombre, correo, asunto, mensaje, creado_en AS \"creadoEn\" FROM mensajes_contacto ORDER BY creado_en DESC"
    );
    res.json(rows);
  })
);

export default router;
