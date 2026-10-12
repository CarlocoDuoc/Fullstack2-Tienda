import { ApiError } from "./errores.js";
import { calcularTotal } from "./mapeos.js";
import { soloErrores, texto, validarCorreoGeneral, validarNombre } from "./validaciones.js";

const MAX_LINEAS = 50;
const MAX_CANTIDAD = 99;

// Valida el cuerpo de POST /api/ordenes y lo deja normalizado. Lanza ApiError(400) si hay errores.
export function prepararOrden(body) {
  const b = body ?? {};
  const cliente = b.cliente ?? {};
  const direccion = b.direccion ?? {};

  const errores = soloErrores({
    nombre: validarNombre(cliente.nombre),
    apellidos: validarNombre(cliente.apellidos, "Los apellidos"),
    correo: validarCorreoGeneral(cliente.correo),
    calle: !texto(direccion.calle)
      ? "La calle es obligatoria."
      : texto(direccion.calle).length > 120
        ? "La calle no puede superar los 120 caracteres."
        : "",
    departamento: texto(direccion.departamento).length > 30 ? "El departamento no puede superar los 30 caracteres." : "",
    region: texto(direccion.region) ? "" : "La región es obligatoria.",
    comuna: texto(direccion.comuna) ? "" : "La comuna es obligatoria.",
    indicaciones: texto(direccion.indicaciones).length > 300 ? "Las indicaciones no pueden superar los 300 caracteres." : "",
  });
  if (errores) throw new ApiError(400, "Revisa los datos de la compra.", errores);

  if (!Array.isArray(b.items) || b.items.length === 0) throw new ApiError(400, "Tu carrito está vacío.");
  if (b.items.length > MAX_LINEAS) throw new ApiError(400, "El carrito tiene demasiados productos distintos.");

  // Une líneas repetidas del mismo producto
  const porProducto = new Map();
  for (const item of b.items) {
    const productoId = Number(item?.productoId);
    const cantidad = Number(item?.cantidad);
    if (!Number.isInteger(productoId) || productoId <= 0 || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_CANTIDAD) {
      throw new ApiError(400, "Hay productos con datos no válidos en el carrito.");
    }
    porProducto.set(productoId, (porProducto.get(productoId) ?? 0) + cantidad);
  }
  const items = [...porProducto].map(([productoId, cantidad]) => ({ productoId, cantidad }));
  if (items.some((i) => i.cantidad > MAX_CANTIDAD)) throw new ApiError(400, `Máximo ${MAX_CANTIDAD} unidades por producto.`);

  const resultado = b.pago?.resultado ?? "aprobado";
  if (!["aprobado", "rechazado"].includes(resultado)) throw new ApiError(400, "El resultado de pago simulado no es válido.");

  return {
    cliente: { nombre: texto(cliente.nombre), apellidos: texto(cliente.apellidos), correo: texto(cliente.correo) },
    direccion: {
      calle: texto(direccion.calle),
      departamento: texto(direccion.departamento),
      region: texto(direccion.region),
      comuna: texto(direccion.comuna),
      indicaciones: texto(direccion.indicaciones),
    },
    items,
    pagoAprobado: resultado === "aprobado",
    guardarDatos: Boolean(b.guardarDatos),
  };
}

// Cruza lo pedido con lo que hay en la base (precio y stock REALES, nunca los del cliente).
// `productos`: filas con id, nombre, imagen, stock y precio_final.
export function armarLineas(items, productos) {
  const porId = new Map(productos.map((p) => [Number(p.id), p]));
  const lineas = items.map(({ productoId, cantidad }) => {
    const producto = porId.get(productoId);
    if (!producto) throw new ApiError(409, `Un producto de tu carrito (#${productoId}) ya no está disponible.`);
    if (cantidad > Number(producto.stock)) {
      const disponible = Number(producto.stock);
      throw new ApiError(
        409,
        disponible === 0
          ? `"${producto.nombre}" está agotado.`
          : `No hay stock suficiente de "${producto.nombre}" (disponible: ${disponible}).`
      );
    }
    return {
      productoId,
      nombre: producto.nombre,
      imagen: producto.imagen,
      precioUnitario: Number(producto.precio_final),
      cantidad,
    };
  });
  return { lineas, total: calcularTotal(lineas) };
}
