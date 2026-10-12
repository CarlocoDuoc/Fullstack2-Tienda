// Filtros y orden del catálogo (funciones puras).
export const OPCIONES_ORDEN = [
  { valor: "relevancia", etiqueta: "Relevancia" },
  { valor: "precio-asc", etiqueta: "Precio: menor a mayor" },
  { valor: "precio-desc", etiqueta: "Precio: mayor a menor" },
  { valor: "nombre", etiqueta: "Nombre (A-Z)" },
];

const normalizar = (texto) =>
  String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function porcentajeDescuento(producto) {
  if (!producto.precioOferta || producto.precioOferta >= producto.precio) return 0;
  return Math.round((1 - producto.precioOferta / producto.precio) * 100);
}

// filtros: { q, categoria, soloOfertas, precioMin, precioMax, orden }
export function aplicarFiltros(productos, filtros = {}) {
  const { q = "", categoria = "", soloOfertas = false, precioMin = "", precioMax = "", orden = "relevancia" } = filtros;
  const consulta = normalizar(q).trim();
  const min = precioMin === "" ? null : Number(precioMin);
  const max = precioMax === "" ? null : Number(precioMax);

  const resultado = productos.filter((p) => {
    if (consulta && !normalizar(`${p.nombre} ${p.descripcion}`).includes(consulta)) return false;
    if (categoria !== "" && String(p.categoriaId) !== String(categoria)) return false;
    if (soloOfertas && !p.enOferta) return false;
    if (min !== null && p.precioFinal < min) return false;
    if (max !== null && p.precioFinal > max) return false;
    return true;
  });

  const copia = [...resultado];
  if (orden === "precio-asc") copia.sort((a, b) => a.precioFinal - b.precioFinal);
  else if (orden === "precio-desc") copia.sort((a, b) => b.precioFinal - a.precioFinal);
  else if (orden === "nombre") copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return copia;
}
