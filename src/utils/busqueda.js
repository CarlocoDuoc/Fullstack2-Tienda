const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// Filtra por nombre o descripción, sin distinguir mayúsculas ni tildes.
export function filtrarProductos(productos, texto) {
  const consulta = normalizar(texto);
  if (!consulta) return productos;
  return productos.filter(
    (p) => normalizar(p.nombre).includes(consulta) || normalizar(p.descripcion).includes(consulta)
  );
}

// Agrupa una lista en bloques de `tamano` elementos (para el carrusel).
export function dividirEnGrupos(lista, tamano) {
  const grupos = [];
  for (let i = 0; i < lista.length; i += tamano) {
    grupos.push(lista.slice(i, i + tamano));
  }
  return grupos;
}
