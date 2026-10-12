// Conversión de filas de PostgreSQL (snake_case) a objetos JSON (camelCase) para el frontend.

export const COLUMNAS_USUARIO = `
  id, nombre, apellidos, usuario, rol, estado, calle, departamento, region, comuna,
  to_char(fecha_nacimiento, 'YYYY-MM-DD') AS "fechaNacimiento"`;

// Producto con su categoría y el precio final (oferta si existe).
export const SELECT_PRODUCTO = `
  SELECT p.id, p.nombre, p.descripcion, p.precio,
         p.precio_oferta AS "precioOferta",
         COALESCE(p.precio_oferta, p.precio) AS "precioFinal",
         (p.precio_oferta IS NOT NULL) AS "enOferta",
         p.imagen, p.destacado, p.stock,
         p.stock_critico AS "stockCritico",
         p.categoria_id AS "categoriaId",
         c.nombre AS "categoriaNombre",
         p.ficha
    FROM productos p
    LEFT JOIN categorias c ON c.id = p.categoria_id`;

export const aProducto = (fila) => ({
  ...fila,
  precio: Number(fila.precio),
  precioOferta: fila.precioOferta === null ? null : Number(fila.precioOferta),
  precioFinal: Number(fila.precioFinal),
  stock: Number(fila.stock),
  stockCritico: Number(fila.stockCritico),
});

export const aOrden = (fila, items = []) => ({
  id: fila.id,
  codigo: fila.codigo,
  usuarioId: fila.usuario_id,
  cliente: { nombre: fila.nombre, apellidos: fila.apellidos, correo: fila.correo },
  direccion: {
    calle: fila.calle,
    departamento: fila.departamento,
    region: fila.region,
    comuna: fila.comuna,
    indicaciones: fila.indicaciones,
  },
  total: Number(fila.total),
  estado: fila.estado,
  creadoEn: fila.creado_en,
  items: items.map((i) => ({
    productoId: i.producto_id,
    nombre: i.nombre,
    imagen: i.imagen,
    precioUnitario: Number(i.precio_unitario),
    cantidad: Number(i.cantidad),
    subtotal: Number(i.precio_unitario) * Number(i.cantidad),
  })),
});

// Suma segura de líneas { precioUnitario, cantidad }
export const calcularTotal = (lineas) => lineas.reduce((acc, l) => acc + l.precioUnitario * l.cantidad, 0);
