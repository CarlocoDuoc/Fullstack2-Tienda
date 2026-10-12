// Lógica pura del carrito (sin React): fácil de probar con Jasmine.
// Cada línea: { productoId, nombre, imagen, precio, cantidad, stock }
export const CLAVE_CARRITO = "dino_carrito";
export const LIMITE_CANTIDAD = 99;

// Deja la cantidad como entero entre 1 y el máximo permitido (stock o 99).
export function limitarCantidad(cantidad, stock = LIMITE_CANTIDAD) {
  const numero = Math.floor(Number(cantidad));
  const maximo = Math.max(1, Math.min(LIMITE_CANTIDAD, Number.isFinite(Number(stock)) ? Number(stock) : LIMITE_CANTIDAD));
  if (!Number.isFinite(numero)) return 1;
  return Math.max(1, Math.min(numero, maximo));
}

export function carritoReducer(items, accion) {
  switch (accion.tipo) {
    case "agregar": {
      const { producto, cantidad = 1 } = accion;
      if (!producto || producto.stock < 1) return items;
      const existente = items.find((i) => i.productoId === producto.id);
      const linea = {
        productoId: producto.id,
        nombre: producto.nombre,
        imagen: producto.imagen,
        precio: producto.precioFinal,
        stock: producto.stock,
        cantidad: limitarCantidad((existente?.cantidad ?? 0) + cantidad, producto.stock),
      };
      return existente ? items.map((i) => (i.productoId === producto.id ? linea : i)) : [...items, linea];
    }
    case "cambiar":
      return items.map((i) => (i.productoId === accion.productoId ? { ...i, cantidad: limitarCantidad(accion.cantidad, i.stock) } : i));
    case "quitar":
      return items.filter((i) => i.productoId !== accion.productoId);
    case "vaciar":
      return [];
    case "reemplazar":
      return accion.items;
    default:
      return items;
  }
}

export const totalCarrito = (items) => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
export const unidadesCarrito = (items) => items.reduce((acc, i) => acc + i.cantidad, 0);

// Lee el carrito guardado ignorando datos corruptos.
export function leerCarrito(almacen = globalThis.localStorage) {
  try {
    const crudo = JSON.parse(almacen?.getItem(CLAVE_CARRITO) ?? "[]");
    if (!Array.isArray(crudo)) return [];
    return crudo
      .filter((i) => i && Number.isInteger(i.productoId) && Number(i.precio) >= 0 && Number(i.cantidad) >= 1)
      .map((i) => ({
        productoId: i.productoId,
        nombre: String(i.nombre ?? ""),
        imagen: String(i.imagen ?? ""),
        precio: Number(i.precio),
        stock: Number.isFinite(Number(i.stock)) ? Number(i.stock) : LIMITE_CANTIDAD,
        cantidad: limitarCantidad(i.cantidad, i.stock),
      }));
  } catch {
    return [];
  }
}

export function guardarCarrito(items, almacen = globalThis.localStorage) {
  try {
    almacen?.setItem(CLAVE_CARRITO, JSON.stringify(items));
  } catch {
    /* sin almacenamiento: el carrito dura mientras la pestaña esté abierta */
  }
}
