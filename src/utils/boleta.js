// Guarda la última orden en sessionStorage para mostrar la boleta tras el pago (incluye compras de invitado).
const CLAVE = "dino_ultima_orden";

export function guardarUltimaOrden(orden, almacen = globalThis.sessionStorage) {
  try {
    almacen?.setItem(CLAVE, JSON.stringify(orden));
  } catch {
    /* sin almacenamiento */
  }
}

export function leerUltimaOrden(almacen = globalThis.sessionStorage) {
  try {
    const orden = JSON.parse(almacen?.getItem(CLAVE) ?? "null");
    return orden && typeof orden === "object" ? orden : null;
  } catch {
    return null;
  }
}

// Enlace mailto con el resumen de la boleta (el envío real lo hace el cliente de correo del usuario).
export function enlaceCorreoBoleta(orden) {
  const lineas = orden.items.map((i) => `- ${i.nombre} x${i.cantidad}: $${i.subtotal.toLocaleString("es-CL")}`);
  const cuerpo = [`Boleta ${orden.codigo}`, "", ...lineas, "", `Total: $${orden.total.toLocaleString("es-CL")}`].join("\n");
  return `mailto:${encodeURIComponent(orden.cliente.correo)}?subject=${encodeURIComponent(`Boleta ${orden.codigo} - Dino Rancho`)}&body=${encodeURIComponent(cuerpo)}`;
}
